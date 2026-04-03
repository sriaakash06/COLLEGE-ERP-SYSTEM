from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import mysql
from routes.auth import role_required
from datetime import datetime

fees_bp = Blueprint('fees', __name__)

@fees_bp.route('/')
@login_required
def fees():
    try:
        cur = mysql.connection.cursor()
        
        if current_user.role == 'admin':
            cur.execute("""
                SELECT f.*, s.reg_no, u.name as student_name, u.email
                FROM fees f
                JOIN students s ON f.student_id = s.id
                JOIN users u ON s.user_id = u.id
                ORDER BY f.due_date DESC
            """)
        elif current_user.role == 'student':
            cur.execute("SELECT id FROM students WHERE user_id = %s", (current_user.id,))
            student = cur.fetchone()
            if student:
                student_id = student[0]
                cur.execute("""
                    SELECT f.*, s.reg_no, u.name as student_name, u.email
                    FROM fees f
                    JOIN students s ON f.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    WHERE f.student_id = %s
                    ORDER BY f.due_date DESC
                """, (student_id,))
            else:
                cur.execute("SELECT * FROM fees WHERE 1=0")
        else:
            cur.execute("SELECT * FROM fees WHERE 1=0")
        
        fees_list = cur.fetchall()
        
        print(f"DEBUG: Fees list length: {len(fees_list)}")
        print(f"DEBUG: Sample fee: {fees_list[0] if fees_list else 'No fees'}")
        
        # Calculate statistics
        total_collected = sum(fee[4] for fee in fees_list if fee[9] == 'Paid')
        total_pending = sum(fee[4] for fee in fees_list if fee[9] == 'Pending')
        total_overdue = sum(fee[4] for fee in fees_list if fee[9] == 'Pending' and fee[5] < datetime.now().date())
        
        stats_data = {
            'total_collected': total_collected,
            'total_pending': total_pending,
            'total_overdue': total_overdue,
            'this_month': 0  # TODO: Calculate this month's collections
        }
        
        print(f"DEBUG: Stats data: {stats_data}")
        
        cur.close()
        
        return render_template('fees/fees.html', fees=fees_list, stats=stats_data)
        
    except Exception as e:
        print(f"Fees error: {e}")
        flash('Error loading fees', 'danger')
        return render_template('fees/fees.html', fees=[])

@fees_bp.route('/add', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def add_fee():
    if request.method == 'POST':
        try:
            student_id = request.form['student_id']
            fee_type = request.form['fee_type']
            amount = request.form['amount']
            due_date = request.form['due_date']
            academic_year = request.form['academic_year']
            semester = request.form.get('semester', '')
            remarks = request.form.get('remarks', '')
            
            cur = mysql.connection.cursor()
            cur.execute("""
                INSERT INTO fees (student_id, fee_type, amount, due_date, academic_year, semester, remarks)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (student_id, fee_type, amount, due_date, academic_year, semester, remarks))
            mysql.connection.commit()
            cur.close()
            
            flash('Fee added successfully!', 'success')
            return redirect(url_for('fees.fees'))
            
        except Exception as e:
            print(f"Add fee error: {e}")
            flash('Error adding fee', 'danger')
    
    # Get students for dropdown
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT s.id, s.reg_no, u.name 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.status = 'Active'
            ORDER BY s.reg_no
        """)
        students = cur.fetchall()
        cur.close()
    except:
        students = []
    
    return render_template('fees/add_fee.html', students=students)

@fees_bp.route('/pay/<int:fee_id>', methods=['POST'])
@login_required
@role_required('admin')
def mark_paid(fee_id):
    try:
        payment_method = request.form['payment_method']
        transaction_id = request.form.get('transaction_id', '')
        
        cur = mysql.connection.cursor()
        cur.execute("""
            UPDATE fees 
            SET status='Paid', paid_date=CURDATE(), payment_method=%s, transaction_id=%s
            WHERE id=%s
        """, (payment_method, transaction_id, fee_id))
        mysql.connection.commit()
        cur.close()
        
        flash('Fee marked as paid!', 'success')
        
    except Exception as e:
        print(f"Mark paid error: {e}")
        flash('Error updating fee', 'danger')
    
    return redirect(url_for('fees.fees'))