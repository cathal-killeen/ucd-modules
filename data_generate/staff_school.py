import psycopg2

psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)
psycopg2.extensions.register_type(psycopg2.extensions.UNICODEARRAY)

conn = psycopg2.connect("dbname=Cathal host=localhost port=5432")

cur = conn.cursor()
cur.execute("SELECT id, raw_name FROM staff")
members = cur.fetchall()
    
print members

for member in members:
    staff_id = member[0]
    staff_name = member[1].encode('utf8')
    cur.execute("""SELECT DISTINCT school FROM module WHERE module_coordinator='%s'""" % staff_name.replace("'","''"))

    staff_schools = cur.fetchall()
    print staff_schools
    
    if len(staff_schools) > 0:
        school_name = staff_schools[0][0]
        print school_name
        cur.execute("""SELECT id FROM school WHERE name='%s'""" % school_name)
        school_id = cur.fetchone()[0]
        print school_id
        cur.execute("""UPDATE staff SET school=%s WHERE id=%s""" % (school_id,staff_id))
    if len(staff_schools) > 1:
        school_name = staff_schools[1][0]
        print school_name
        cur.execute("""SELECT id FROM school WHERE name='%s'""" % school_name)
        school_id = cur.fetchone()[0]
        print school_id
        cur.execute("""UPDATE staff SET school_2=%s WHERE id=%s""" % (school_id,staff_id))
    if len(staff_schools) > 2:
        school_name = staff_schools[2][0]
        print school_name
        cur.execute("""SELECT id FROM school WHERE name='%s'""" % school_name)
        school_id = cur.fetchone()[0]
        print school_id
        cur.execute("""UPDATE staff SET school_3=%s WHERE id=%s""" % (school_id,staff_id))


conn.commit()
conn.close()