#!/usr/bin/env python3
"""
College ERP System Runner
Simple script to run the College ERP application
"""

import os
import sys

def main():
    """Main function to run the application"""
    # Add backend directory to Python path
    backend_path = os.path.join(os.path.dirname(__file__), 'backend')
    sys.path.insert(0, backend_path)
    
    # Import and run the app
    try:
        from app import create_app
        app = create_app()
        print("=" * 50)
        print("    College ERP System")
        print("=" * 50)
        print("Starting server...")
        print("Access at: http://localhost:5000")
        print("Default login: admin@college.edu / admin123")
        print("=" * 50)
        print("\nPress Ctrl+C to stop the server\n")
        
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except ImportError as e:
        print(f"Import error: {e}")
        print("Please run setup.py first to install dependencies")
        sys.exit(1)
    except Exception as e:
        print(f"Error running application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
