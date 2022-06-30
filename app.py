from flask import Flask, jsonify, request, make_response, redirect, url_for
from flask_cors import CORS
from flask_migrate import Migrate
from neo4j import GraphDatabase, basic_auth


app = Flask(__name__)
CORS(app)

# pip3 install neo4j-driver
# python3 example.py
def relation_and_reciproque(lien):
    dataset = {
            'FILS': ['EST_FILS_DE', 'EST_PARENT_DE', 'CHILD'],
            'FILLE': ['EST_FILLE_DE', 'EST_PARENT_DE', 'CHILD'],
            'COUSIN': ['EST_COUSIN_DE', 'EST_COUSIN_OU_COUSINE_DE', ''],
            'COUSINE': ['EST_COUSINE_DE', 'EST_COUSIN_OU_COUSINE_DE', ''],
            'TANTE': ['EST_TANTE_DE', 'EST_NEVEUX_OU_NIECE_DE', ''],
            'ONCLE': ['EST_ONCLE_DE', 'EST_NEVEUX_OU_NIECE_DE', ''],
            'PERE': ['EST_PERE_DE', 'EST_FILS_OU_FILLE_DE', 'PARENT'],
            'MERE': ['EST_MERE_DE', 'EST_FILS_OU_FILLE_DE', 'PARENT'],
            'GRDPERE': ['EST_GRDPERE_DE', 'EST_PTFILS_OU_PTFILLE_DE', ''],
            'GRDMERE': ['EST_GRDMERE_DE', 'EST_PTFILS_OU_PTFILLE_DE', ''],
            'FRERE': ['EST_FRERE_DE', 'EST_FRERE_OU_SOEUR_DE', 'SIBLING'],
            'SOEUR': ['EST_SOEUR_DE', 'EST_FRERE_OU_SOEUR_DE', 'SIBLING']
    }
    return dataset.get(lien)

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


@app.route('/all/relations/<string:username>', methods=['GET'])
def all_relations(username):
    query_child = """
                MATCH (:USER {username: '%s'})--(p :CHILD)
                RETURN DISTINCT p
            """ % (username)

    query_parent = """
                MATCH (:USER {username: '%s'})--(p :PARENT)
                RETURN DISTINCT p
            """ % (username)
    query_sibling = """
                MATCH (:USER {username: '%s'})--(p :SIBLING)
                RETURN DISTINCT p
            """ % (username)
    try:
        parents = from_database(query_parent)
        siblings = from_database(query_sibling)
        children = from_database(query_child)
        data = {
            'parents' : parents,
            'siblings' : siblings,
            'children' : children
        }

        return jsonify({'relations': data}), 200
    except Exception as e:
        return jsonify({'message': e}), 405


@app.route('/create/member', methods=['POST'])
def create_member():
    data = request.get_json()
    username = data.get('from').get('username')
    relationship = relation_and_reciproque(data.get('lien'))[0]
    reciproque = relation_and_reciproque(data.get('lien'))[1]
    status = relation_and_reciproque(data.get('lien'))[2]
    prenom = data.get('prenom')
    nom = data.get('nom')
    lien = data.get('lien')
    new_username = data.get('username')

    # print(data)
    query = """
                match (p:USER :ACCESS {username:"%s"})
                create (p) -[:%s]-> (x:MEMBER :%s {username: '%s', prenom: '%s', nom: '%s', lien:'%s'})-[:%s]->(p)
            """  % (username, reciproque, status, new_username, prenom, nom, lien, relationship)


    try:
        res = to_database(query)
        return jsonify({'message': 'ok'}), 201
    except Exception as e:
        return jsonify({'message' : e}), 405



@app.route('/user/infos/<string:username>', methods=['GET', 'POST'])
def complete_user_infos(username):
    data = request.get_json()

    name       = data.get('name')
    age        = data.get('age')
    prenom     = data.get('prenom')
    sexe       = data.get('sexe')
    address    = data.get('address')
    phone      = data.get('phone')
    profession = data.get('profession')

    # print(data)
    query = """
            match p = (x:ACCESS :USER {username: '%s'})
            set x.name = '%s',
                x.prenom= '%s',
                x.sexe= '%s',
                x.address = '%s',
                x.phone = '%s',
                x.profession='%s',
                x.age = '%s'
            """ % (username, name, prenom, sexe, address,phone, profession, age)
    # print(query)
    try:
        send = to_database(query)
        return jsonify({'message' : 'user info completed!'}), 200
    except Exception as e:
        return jsonify({'message' : 'error'}),405
    return jsonify(data)


@app.route('/delete/<string:username>', methods=['GET'])
def delete_user(username):
    user_to_delete = "match p = (:ACCESS :USER {username: '%s'}) detach delete p " % (username)
    try:
        res = to_database(user_to_delete)
        return jsonify({'message' : 'user deleted !'}), 200
    except Exception as e:
        print(e)
        return jsonify({'message' : 'mauvaise manipulation !'})


@app.route('/update/<string:username>', methods=['PUT'])
def update_user(username):
    data = request.get_json()
    new_username = data.get('username')
    new_name     = data.get('name')
    new_password = data.get('password')
    new_profil   = data.get('profil')

    update_query = """
                    match p = (x:ACCESS :USER {username: '%s'})
                    set x.username = '%s',
                        x.name ='%s',
                        x.password ='%s',
                        x.profil= '%s'
                    """ % (username, new_username, new_name, new_password, new_profil)

    try:
        execute = to_database(update_query)
    except Exception as e:
        print(e)
        return jsonify({'message': 'error '}), 405

    return jsonify({'message': 'ok'}), 201



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
        try:
            res = to_database(create_user)
        except Exception as e:
            return jsonify({'message' : 'cet utilisateur existe deja !'}), 409

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
