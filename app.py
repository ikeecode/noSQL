from flask import Flask, jsonify, request, make_response, redirect, url_for
from flask_cors import CORS
from flask_migrate import Migrate
from neo4j import GraphDatabase, basic_auth


app = Flask(__name__)
CORS(app)

# pip3 install neo4j-driver
# python3 example.py

def connect_to_neo4j():
    driver = GraphDatabase.driver(
      "bolt://18.206.148.59:7687",
      auth=basic_auth("neo4j", "summaries-counselors-rumble"))
    return driver

def from_database(query):
    driver = connect_to_neo4j()
    with driver.session(database="famille") as session:
      results = session.read_transaction(lambda tx: tx.run(query).data())

    driver.close()
    return results


def to_database(query):
    driver = connect_to_neo4j()
    with driver.session(database="famille") as session:
      results = session.write_transaction(lambda tx: tx.run(query))

    driver.close()
    return results



@app.route('/')
def home():
    cypher_query = '''
    MATCH (n)
    RETURN n
    '''
    results = from_database(cypher_query)
    for result in results:
        print(result)

    return '<h1>HELLO YOU</h1>'

@app.route('/all/users', methods=['GET'])
def all_users():
    query = "match p = (:USER :ACCESS) return p"
    res = from_database(query)

    if res:
        data = []
        for result in res:
            data.append(result.get('p')[0])

        # print(data)
        return jsonify(data), 200
    else:
        return jsonify({'message': 'no data'}), 404

@app.route('/add/user', methods=['POST'])
def add_user():
    name = username = password = None
    data = request.get_json()
    if data:
        name = data.get('name')
        username = data.get('username')
        password = data.get('password')
        create_user = "create (usr:ACCESS :USER {name:'%s', profil:'user', password:'%s', username:'%s'}) return usr" % (name, password, username)
        res = to_database(create_user)
        return jsonify({'user':'created'}), 201
    else:
        return jsonify({'message': 'mauvaise manipulation !'})




@app.route('/connexion', methods=['GET', 'POST'])
def connexion():
    usr_password = None
    data = request.get_json()
    query_user = "match (usr:ACCESS {username: '%s'}) return usr" % (data.get('username').strip())
    results = from_database(query_user)
    if results:
        usr_password = results[0]['usr'].get('password').strip()
        if usr_password == data.get('password').strip():
            return jsonify(results[0]['usr']), 302
        else:
            return jsonify({'message' : 'you are not allowed !'}), 401
    else:
        return jsonify({'message': 'cet utilisateur n\'existe pas !'}), 404

if __name__ == '__main__':
    app.run(debug=True)
