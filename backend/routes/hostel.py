from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from db import db
from routes.auth import role_required
from datetime import datetime

hostel_bp = Blueprint('hostel', __name__)

@hostel_bp.route('/')
@login_required
@role_required('admin')
def hostel():
    try:
        # Get all hostels
        hostels_docs = db.collection('hostel').stream()
        hostels = []
        for doc in hostels_docs:
            h = doc.to_dict()
            h['id'] = doc.id
            hostels.append(h)
            
        # Get allocations with status 'Allocated'
        allocations_docs = db.collection('hostel_allocation').where('status', '==', 'Allocated').stream()
        allocations = []
        for doc in allocations_docs:
            a = doc.to_dict()
            a['id'] = doc.id
            allocations.append(a)
            
        rooms_list = []
        total_rooms_count = 0
        
        # Helper to find allocations for a specific room
        def get_room_allocations(hostel_id, room_no):
            return [a for a in allocations if a.get('hostel_id') == hostel_id and str(a.get('room_no')) == str(room_no)]

        for h in hostels:
            h_rooms = int(h.get('total_rooms', 0))
            h_capacity = int(h.get('capacity_per_room', 0))
            total_rooms_count += h_rooms
            
            # Generate virtual rooms from 1 to total_rooms
            for r in range(1, h_rooms + 1):
                room_num = str(r)
                room_allocs = get_room_allocations(h['id'], r)
                occupied_count = len(room_allocs)
                
                rooms_list.append({
                    'room_number': room_num,
                    'block_name': h.get('name'), # hostel name
                    'capacity': h_capacity,
                    'occupied': occupied_count,
                    'available': h_capacity - occupied_count,
                    'room_type': h.get('type'),
                    'hostel_id': h['id']
                })

        total_students = len(allocations)
        # Occupied = room has at least 1 student
        occupied_rooms_count = sum(1 for r in rooms_list if r['occupied'] > 0)
        # Available = Total - Occupied (meaning empty rooms)
        available_rooms_count = total_rooms_count - occupied_rooms_count
        
        stats = {
            'total_rooms': total_rooms_count,
            'occupied_rooms': occupied_rooms_count,
            'available_rooms': available_rooms_count,
            'total_students': total_students
        }
        
        return render_template('hostel/hostel.html', stats=stats, rooms=rooms_list)
        
    except Exception as e:
        print(f"Hostel error: {e}")
        flash('Error loading hostels', 'danger')
        return render_template('hostel/hostel.html', stats={}, rooms=[])

@hostel_bp.route('/add_hostel', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def add_hostel():
    if request.method == 'POST':
        try:
            data = {
                'name': request.form['name'],
                'type': request.form['type'],
                'total_rooms': int(request.form['total_rooms']),
                'capacity_per_room': int(request.form['capacity_per_room']),
                'address': request.form.get('address', ''),
                'phone': request.form.get('phone', ''),
                'email': request.form.get('email', '')
            }
            
            db.collection('hostel').add(data)
            
            flash('Hostel added successfully!', 'success')
            return redirect(url_for('hostel.hostel'))
            
        except Exception as e:
            print(f"Add hostel error: {e}")
            flash('Error adding hostel', 'danger')
    
    return render_template('hostel/add_hostel.html')

@hostel_bp.route('/allocate/<hostel_id>', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def allocate_room(hostel_id):
    if request.method == 'POST':
        try:
            student_id = request.form['student_id']
            room_no = request.form['room_no']
            bed_no = request.form.get('bed_no', '')
            
            # Check if student is already allocated
            existing = db.collection('hostel_allocation').where('student_id', '==', student_id).where('status', '==', 'Allocated').limit(1).get()
            
            if len(existing) > 0:
                flash('Student is already allocated to a room', 'danger')
                return redirect(url_for('hostel.allocate_room', hostel_id=hostel_id))
            
            # Allocate room
            data = {
                'student_id': student_id,
                'hostel_id': hostel_id,
                'room_no': room_no,
                'bed_no': bed_no,
                'status': 'Allocated',
                'allocation_date': datetime.now().strftime('%Y-%m-%d')
            }
            db.collection('hostel_allocation').add(data)
            
            flash('Room allocated successfully!', 'success')
            return redirect(url_for('hostel.allocations'))
            
        except Exception as e:
            print(f"Allocate room error: {e}")
            flash('Error allocating room', 'danger')
    
    # Get students and hostel details
    try:
        # Fetch active students not in hostel
        all_students = db.collection('students').where('status', '==', 'Active').stream()
        active_allocations = db.collection('hostel_allocation').where('status', '==', 'Allocated').stream()
        allocated_student_ids = {a.to_dict().get('student_id') for a in active_allocations}
        
        students = []
        for s_doc in all_students:
            s_data = s_doc.to_dict()
            if s_doc.id not in allocated_student_ids:
                # Fetch user info for name
                u_doc = db.collection('users').document(s_data.get('user_id')).get()
                if u_doc.exists:
                    u_data = u_doc.to_dict()
                    students.append({
                        'id': s_doc.id,
                        'reg_no': s_data.get('reg_no'),
                        'name': u_data.get('name')
                    })
        
        students.sort(key=lambda x: x['reg_no'])
        
        hostel_doc = db.collection('hostel').document(hostel_id).get()
        if not hostel_doc.exists:
            flash('Hostel not found', 'danger')
            return redirect(url_for('hostel.hostel'))
            
        hostel_data = hostel_doc.to_dict()
        hostel_data['id'] = hostel_doc.id
            
        return render_template('hostel/allocate_room.html', hostel=hostel_data, hostel_id=hostel_id, students=students)
        
    except Exception as e:
        print(f"Allocate room load error: {e}")
        flash('Error loading form', 'danger')
        return redirect(url_for('hostel.hostel'))

@hostel_bp.route('/allocations')
@login_required
@role_required('admin')
def allocations():
    try:
        alloc_docs = db.collection('hostel_allocation').where('status', '==', 'Allocated').stream()
        allocations_list = []
        
        for doc in alloc_docs:
            a = doc.to_dict()
            a['id'] = doc.id
            
            # Fetch hostel name
            h_doc = db.collection('hostel').document(a.get('hostel_id')).get()
            if h_doc.exists:
                h_data = h_doc.to_dict()
                a['hostel_name'] = h_data.get('name')
                a['hostel_type'] = h_data.get('type')
            
            # Fetch student/user info
            s_doc = db.collection('students').document(a.get('student_id')).get()
            if s_doc.exists:
                s_data = s_doc.to_dict()
                a['reg_no'] = s_data.get('reg_no')
                u_doc = db.collection('users').document(s_data.get('user_id')).get()
                if u_doc.exists:
                    u_data = u_doc.to_dict()
                    a['student_name'] = u_data.get('name')
                    a['student_email'] = u_data.get('email')
                    
            allocations_list.append(a)
            
        # Sort by hostel name and room no
        allocations_list.sort(key=lambda x: (x.get('hostel_name', ''), str(x.get('room_no', ''))))
        
        return render_template('hostel/allocations.html', allocations=allocations_list)
        
    except Exception as e:
        print(f"Allocations error: {e}")
        flash('Error loading allocations', 'danger')
        return render_template('hostel/allocations.html', allocations=[])

@hostel_bp.route('/vacate/<allocation_id>', methods=['POST'])
@login_required
@role_required('admin')
def vacate_room(allocation_id):
    try:
        db.collection('hostel_allocation').document(allocation_id).update({
            'status': 'Vacated',
            'vacate_date': datetime.now().strftime('%Y-%m-%d')
        })
        
        flash('Room vacated successfully!', 'success')
        
    except Exception as e:
        print(f"Vacate room error: {e}")
        flash('Error vacating room', 'danger')
    
    return redirect(url_for('hostel.allocations'))
