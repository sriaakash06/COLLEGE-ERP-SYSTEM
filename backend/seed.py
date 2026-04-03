import os
import sys
import mysql.connector
from config import Config
import bcrypt

def connect():
    cfg = Config()
    try:
        conn = mysql.connector.connect(
            host=cfg.MYSQL_HOST,
            user=cfg.MYSQL_USER,
            password=cfg.MYSQL_PASSWORD,
            database=cfg.MYSQL_DB
        )
        return conn
    except mysql.connector.Error as e:
        print('DB connection error:', e)
        return None

def run_sql_file(conn, path):
    with open(path, 'r', encoding='utf-8') as f:
        sql = f.read()
    # split on ; but keep simple
    statements = [s.strip() for s in sql.split(';') if s.strip()]
    cur = conn.cursor()
    for stmt in statements:
        try:
            cur.execute(stmt)
        except Exception as e:
            print('Statement failed:', e)
    conn.commit()
    cur.close()

def migrate_passwords(conn):
    cur = conn.cursor()
    cur.execute("SELECT id, email, password FROM users")
    rows = cur.fetchall()
    updated = 0
    for r in rows:
        uid, email, pw = r
        if not pw:
            continue
        if not (pw.startswith('$2b$') or pw.startswith('$2a$')):
            # hash and update
            new_hash = bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            try:
                cur.execute("UPDATE users SET password=%s WHERE id=%s", (new_hash, uid))
                updated += 1
            except Exception as e:
                print('Failed to update password for', email, e)
    conn.commit()
    cur.close()
    print(f'Migrated {updated} user passwords to bcrypt.')

def main():
    conn = connect()
    if not conn:
        print('Unable to connect to DB. Check `backend/config.py` settings and that MySQL is running.')
        sys.exit(1)

    # Optionally run SQL file if user wants to create schema
    sql_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'college_erp.sql')
    if os.path.exists(sql_path):
        ans = input('Run SQL seed file to create schema and sample data? (y/N): ').strip().lower()
        if ans == 'y':
            run_sql_file(conn, sql_path)
            print('SQL file executed (some statements may have failed if objects already exist).')

    # Migrate existing plain passwords to bcrypt
    migrate_passwords(conn)
    conn.close()

if __name__ == '__main__':
    main()
