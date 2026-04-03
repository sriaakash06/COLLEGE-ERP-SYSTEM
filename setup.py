#!/usr/bin/env python3
"""
College ERP System Setup Script
This script helps set up the College ERP system with database initialization
"""

import os
import sys
import mysql.connector
from mysql.connector import Error
import bcrypt
import getpass

def create_database():
    """Create the database and user if they don't exist"""
    try:
        # Connect to MySQL without database
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=input("Enter MySQL root password: ")
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database
            cursor.execute("CREATE DATABASE IF NOT EXISTS college_erp")
            print("✓ Database 'college_erp' created successfully")
            
            # Use the database
            cursor.execute("USE college_erp")
            
            # Read and execute schema file
            schema_path = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')
            if os.path.exists(schema_path):
                with open(schema_path, 'r') as file:
                    schema_sql = file.read()
                
                # Split SQL statements and execute
                statements = schema_sql.split(';')
                for statement in statements:
                    if statement.strip():
                        try:
                            cursor.execute(statement)
                        except Error as e:
                            if "already exists" not in str(e):
                                print(f"Warning: {e}")
                
                connection.commit()
                print("✓ Database schema imported successfully")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print(f"❌ Error creating database: {e}")
        return False

def update_config():
    """Update configuration file with user inputs"""
    config_path = os.path.join(os.path.dirname(__file__), 'backend', 'config.py')
    
    print("\n=== Database Configuration ===")
    host = input("MySQL Host (default: localhost): ") or 'localhost'
    user = input("MySQL User (default: root): ") or 'root'
    password = getpass.getpass("MySQL Password: ")
    database = input("Database Name (default: college_erp): ") or 'college_erp'
    
    config_content = f'''class Config:
    MYSQL_HOST = '{host}'
    MYSQL_USER = '{user}'
    MYSQL_PASSWORD = '{password}'
    MYSQL_DB = '{database}'
    SECRET_KEY = 'erp_secret_key_change_in_production'
'''
    
    try:
        with open(config_path, 'w') as file:
            file.write(config_content)
        print("✓ Configuration updated successfully")
        return True
    except Exception as e:
        print(f"❌ Error updating configuration: {e}")
        return False

def install_dependencies():
    """Install Python dependencies"""
    try:
        requirements_path = os.path.join(os.path.dirname(__file__), 'backend', 'requirements.txt')
        
        print("\n=== Installing Dependencies ===")
        os.system(f'pip install -r "{requirements_path}"')
        print("✓ Dependencies installed successfully")
        return True
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def create_admin_user():
    """Create additional admin users"""
    try:
        import mysql.connector
        from backend.config import Config
        
        connection = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            print("\n=== Create Admin User ===")
            name = input("Admin Name: ")
            email = input("Admin Email: ")
            password = getpass.getpass("Admin Password: ")
            
            # Hash password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Insert admin user
            cursor.execute("""
                INSERT INTO users (name, email, password, role) 
                VALUES (%s, %s, %s, 'admin')
            """, (name, email, hashed_password))
            
            connection.commit()
            print(f"✓ Admin user '{email}' created successfully")
            
            cursor.close()
            connection.close()
            return True
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False

def main():
    """Main setup function"""
    print("=" * 50)
    print("    College ERP System Setup")
    print("=" * 50)
    
    # Step 1: Install dependencies
    if not install_dependencies():
        print("❌ Setup failed at dependency installation")
        sys.exit(1)
    
    # Step 2: Create database
    if not create_database():
        print("❌ Setup failed at database creation")
        sys.exit(1)
    
    # Step 3: Update configuration
    if not update_config():
        print("❌ Setup failed at configuration update")
        sys.exit(1)
    
    # Step 4: Ask for additional admin user
    create_admin = input("\nDo you want to create an additional admin user? (y/n): ").lower()
    if create_admin == 'y':
        create_admin_user()
    
    print("\n" + "=" * 50)
    print("    Setup Completed Successfully!")
    print("=" * 50)
    print("\nNext Steps:")
    print("1. Run the application: cd backend && python app.py")
    print("2. Open browser: http://localhost:5000")
    print("3. Login with: admin@college.edu / admin123")
    print("\n⚠️  Important: Change default passwords in production!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
