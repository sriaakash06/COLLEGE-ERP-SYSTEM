
from flask import Flask, render_template, redirect, url_for, flash, request
from flask_login import LoginManager, current_user
from db import init_firebase, get_firestore
from models.user import User
import os
import traceback

def create_app():
    app = Flask(__name__, 
                template_folder='../frontend/templates',
                static_folder='../frontend/static')
                
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # Initialize Firebase
    init_firebase(app)
    
    # Login Manager
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'

    @login_manager.user_loader
    def load_user(user_id):
        # Always use Firestore for user loading
        db = get_firestore()
        if not db:
            return None
        
        try:
            doc = db.collection('users').document(str(user_id)).get()
            if doc.exists:
                data = doc.to_dict()
                return User(doc.id, data.get('name'), data.get('email'), data.get('role'))
        except Exception as e:
            traceback.print_exc()
        return None

    # Register Blueprints
    from routes.auth import auth_bp
    from routes.students import students_bp
    from routes.staff import staff_bp
    from routes.courses import courses_bp
    from routes.attendance import attendance_bp
    from routes.exams import exams_bp
    from routes.fees import fees_bp
    from routes.library import library_bp
    from routes.hostel import hostel_bp
    from routes.notices import notices_bp
    from routes.timetable import timetable_bp

    app.register_blueprint(auth_bp, url_prefix='/')
    app.register_blueprint(students_bp, url_prefix='/students')
    app.register_blueprint(staff_bp, url_prefix='/staff')
    app.register_blueprint(courses_bp, url_prefix='/courses')
    app.register_blueprint(attendance_bp, url_prefix='/attendance')
    app.register_blueprint(exams_bp, url_prefix='/exams')
    app.register_blueprint(fees_bp, url_prefix='/fees')
    app.register_blueprint(library_bp, url_prefix='/library')
    app.register_blueprint(hostel_bp, url_prefix='/hostel')
    app.register_blueprint(notices_bp, url_prefix='/notices')
    app.register_blueprint(timetable_bp, url_prefix='/timetable')

    # Global context for UI
    @app.context_processor
    def inject_user():
        return dict(user=current_user)

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('404.html'), 404

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
