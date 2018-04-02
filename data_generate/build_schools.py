import psycopg2

psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)
psycopg2.extensions.register_type(psycopg2.extensions.UNICODEARRAY)


conn = psycopg2.connect("dbname=Cathal host=localhost port=5432")


cur = conn.cursor()
cur.execute("SELECT DISTINCT school FROM module")
schools = cur.fetchall()
    
print schools

for school in schools:
    school_name = school[0].encode('utf8')
    url_name = ''.join(e for e in school_name if e.isalnum())
    print school_name
    print url_name
    cur.execute("""SELECT COUNT(code) FROM module WHERE school = '%s'""" % school_name)
    count_modules = cur.fetchone()[0]
    print 'Modules:', count_modules

    cur.execute("""SELECT COUNT(DISTINCT module_coordinator) FROM module WHERE school = '%s'""" % school_name)
    count_staff = cur.fetchone()[0]
    print 'Staff:', count_staff

    cur.execute("""SELECT COUNT(DISTINCT subject) FROM module WHERE school = '%s'""" % school_name)
    count_subjects = cur.fetchone()[0]
    print 'Subjects:', count_subjects

    cur.execute("""INSERT INTO school (name, url_name, count_subjects, count_staff, count_modules) VALUES ('%s','%s',%s,%s,%s)""" % (school_name, url_name, count_subjects, count_staff, count_modules))

conn.commit()
conn.close()