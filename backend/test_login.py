from app import app

def test_login(email, password):
    with app.test_client() as c:
        resp = c.post('/', data={'email': email, 'password': password}, headers={'X-Requested-With':'XMLHttpRequest'})
        print('status:', resp.status_code)
        print('data:', resp.get_data(as_text=True))

if __name__ == '__main__':
    test_login('admin@college.edu','admin123')
