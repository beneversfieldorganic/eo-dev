from flask import render_template, jsonify, json
import csv
from .get_conn import get_conn as get_conn

days_dict = {}
days_dict['Monday'] = 0
days_dict['Tuesday'] = 1
days_dict['Wednesday'] = 2
days_dict['Thursday'] = 3
days_dict['Friday'] = 4
days_dict['Saturday'] = 5
days_dict['Sunday'] = 6

days_dict_reverse = {}
days_dict_reverse[0] = 'Monday'
days_dict_reverse[1] = 'Tuesday'
days_dict_reverse[2] = 'Wednesday'
days_dict_reverse[3] = 'Thursday'
days_dict_reverse[4] = 'Friday'
days_dict_reverse[5] = 'Saturday'
days_dict_reverse[6] = 'Sunday'


def get_all_rounds(cur):
    to_return = []
    sql = """select distinct(`description`) from delivery_postcodes"""
    cur.execute(sql)
    result = cur.fetchall()
    print(result)
    for r in result:
        to_return.append(r[0])
    return to_return

def create_delivery_round(name, days, amount, postcodes, cur, cnx):
    days_string = ''
    days_list = days.split(',')
    for day in days_list:
        days_string = days_string + str(days_dict.get(day))+','
    for code in postcodes:
        sql = """replace into delivery_postcodes 
        (postcode, delivery_day, description, cost) 
        values ('{}','{}','{}',{})""".format(code, days_string.rstrip(','), name, amount*100)
        cur.execute(sql)
    cnx.commit()


def render(values, template):
    conn = get_conn()
    cnx = conn[0]
    cur = conn[1]

    if values.get('function') == 'initialLoad':
        data = {}
        postcode_districts = []
        with open('static/data/postcodes.csv', newline='') as f:
            reader = csv.reader(f)
            postcode_data = list(reader)
        postcode_data = postcode_data[1:]
        for row in postcode_data:
            postcode_districts.append(row[0])
        data['all_rounds'] = get_all_rounds(cur)
        data['postcode_districts'] = postcode_districts
        cnx.close()
        return jsonify(data = data)


    if values.get('function') == 'runCreate':
        delivery_name = values.get('deliveryScheduleName')
        delivery_price = float(values.get('deliverySchedulePrice'))
        schedule = values.get('newDeliverySchedule')
        delivery_postcodes = values.get('postcodes').split(',')
        create_delivery_round(delivery_name, schedule, delivery_price, delivery_postcodes, cur, cnx)
        cnx.close()
        return jsonify({'response':'success'})

    if values.get('function') == 'runDelete':
        scheduleSelected = values.get('scheduleSelected')
        sql = """delete from `delivery_postcodes` where `description` = '{}'""".format(scheduleSelected)
        print (sql)
        cur.execute(sql)
        cnx.commit()
        cnx.close()
        return jsonify({'response':'success'})

    if values.get('function') == 'loadDeliverySchedule':
        delivery_name = values.get('scheduleSelected')
        sql = """select * from delivery_postcodes where `description` = '{}'""".format(delivery_name)
        cur.execute(sql)
        result = cur.fetchall()
        postcodes = []
        delivery_days = []
        cost_list = []
        for r in result:
            postcodes.append(r[1])
            delivery_days.append(r[2])
            cost_list.append(r[4])

        postcodes = list(set(postcodes))
        delivery_days = list(set(delivery_days))
        cost_list = list(set(cost_list))

        # delivery_days and cost_list should only have a length of 1
        if len(cost_list) > 1 or len(delivery_days) > 1:
            status = 'Error'
            message = 'Distinct costs > 1 or distinct delivery schedules > 1'
        else:
            status = 'Success'
            message = ''

        print('{}: {}'.format(status, message))

        delivery_days_string_list = []
        delivery_days= delivery_days[0].split(',')
        for day in delivery_days:
            delivery_days_string_list.append(days_dict_reverse.get(int(day)))

        to_return = {}
        to_return['postcodes'] = postcodes
        to_return['delivery_days'] = delivery_days
        to_return['cost_list'] = cost_list
        to_return['delivery_days_string_list'] = delivery_days_string_list



        cnx.close()
        return jsonify(data=to_return)


    cnx.close()
    return render_template(template)