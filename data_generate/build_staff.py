import psycopg2

psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)
psycopg2.extensions.register_type(psycopg2.extensions.UNICODEARRAY)


conn = psycopg2.connect("dbname=Cathal host=localhost port=5432")


cur = conn.cursor()
cur.execute("SELECT DISTINCT module_coordinator FROM module")
staff = cur.fetchall()

def parse_name (raw_name):
    values = {'name':'','first_name':'','last_name':'','unknown_name':False,'short_title':'','title':'','url_name':''}

    # Assoc Professor before Professor
    if 'Assoc Professor ' in raw_name:
        values['name'] = raw_name.replace('Assoc Professor ', '')
        values['short_title'] = 'Assoc. Prof.'
        values['title'] = 'Associate Professor'
    elif 'Dr ' in raw_name:
        values['name'] = raw_name.replace('Dr ', '')
        values['short_title'] = 'Dr.'
        values['title'] = 'Dr.'
    elif 'Miss ' in raw_name:
        values['name'] = raw_name.replace('Miss ', '')
        values['short_title'] = 'Miss'
        values['title'] = 'Miss'
    ## Mrs before Mr
    elif 'Mrs ' in raw_name:
        values['name'] = raw_name.replace('Mrs ', '')
        values['short_title'] = 'Mrs.'
        values['title'] = 'Mrs.'
    elif 'Mr ' in raw_name:
        values['name'] = raw_name.replace('Mr ', '')
        values['short_title'] = 'Mr.'
        values['title'] = 'Mr.'
    elif 'Ms ' in raw_name:
        values['name'] = raw_name.replace('Ms ', '')
        values['short_title'] = 'Ms'
        values['title'] = 'Ms'
    elif 'Professor ' in raw_name:
        values['name'] = raw_name.replace('Professor ', '')
        values['short_title'] = 'Prof.'
        values['title'] = 'Professor'
    else:
        values['name'] = raw_name
    
    if 'NAME NOT FOUND FOR PIDM:' in raw_name:
        values['name'] = 'Unknown'
        values['unknown_name'] = True
        values['url_name'] = 'unknown_staff'
    else:
        split_name = values['name'].split(' ', 1)
        values['first_name'] = split_name[0]
        values['last_name'] = split_name[1]
        values['url_name'] = ''.join(e for e in values['name'] if e.isalnum())

    return values
    

for member in staff:
    raw_name = member[0].encode('utf8')

    n = parse_name(raw_name)

    cur.execute("""SELECT COUNT(code) FROM module WHERE module_coordinator = '%s'""" % raw_name.replace("'","''"))
    count_modules = cur.fetchone()[0]
    print 'Modules:', count_modules

    cur.execute("""SELECT COUNT(DISTINCT school) FROM module WHERE module_coordinator = '%s'""" % raw_name.replace("'","''"))
    count_schools = cur.fetchone()[0]
    print 'Schools:', count_schools

    cur.execute("""SELECT COUNT(DISTINCT subject) FROM module WHERE module_coordinator = '%s'""" % raw_name.replace("'","''"))
    count_subjects = cur.fetchone()[0]
    print 'Subjects:', count_subjects

    cur.execute("""INSERT INTO staff (raw_name, name, first_name, last_name, short_title, title, url_name, count_modules, count_schools, count_subjects, unknown_name)  VALUES ('%s','%s','%s','%s','%s','%s','%s',%s,%s,%s,%s)""" % (raw_name.replace("'","''"), n['name'].replace("'","''"), n['first_name'].replace("'","''"), n['last_name'].replace("'","''"), n['short_title'], n['title'], n['url_name'], count_modules, count_schools, count_subjects, n['unknown_name']) )

conn.commit()
conn.close()