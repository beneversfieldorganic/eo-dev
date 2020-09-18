function buildSelect(data_list, selectId){
    $(selectId).html('').select2({data: [{id: '', text: ''}]});
    for (d in data_list){
        var newOption = new Option(data_list[d], data_list[d], false, false);
        $(selectId).append(newOption).trigger('change');
    }
}

function selectAllPostcodes(){
    $('#postcodeSelect').select2('destroy').find('option').prop('selected', 'selected').end().select2();
}

function clearAllPostcodes(){
    $('#postcodeSelect').select2('destroy').find('option').prop('selected', false).end().select2();
}

function getPostcodes(){
    postcodes = [];
    var postcodesSelected = document.getElementById('postcodeSelect');
    for (var i = 0; i < postcodesSelected.options.length; i++) {
      if (postcodesSelected.options[i].selected) {
        var cleaned = encodeURIComponent(postcodesSelected.options[i].value);
        postcodes.push(cleaned);
      }
    }
    return postcodes
}

function initSelect()
{
    $('#deliveryScheduleSelect').select2();
    $('#newDeliverySchedule').select2();
    $('#modifyDeliverySchedule').select2();
    $('#updateDeliverySchedule').select2();
    $('#deleteScheduleSelect').select2();
    $('#postcodeSelect').select2();
}

function runCreate()
{
    var req = new XMLHttpRequest()
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status != 200)
            {
                //error handling code here
            }
            else
            {
                var response = JSON.parse(req.responseText)
                if (response['response'] == 'success')
                {
                    $('#createSuccessMessage').removeClass('d-none')
                    setTimeout(() => {  initialLoad(); }, 2000);
                    initialLoad()

                }
            }
        }
    }
    req.open('POST', '/postcodes')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    deliveryScheduleName = $('#newDeliveryName').val();
    deliverySchedulePrice = $('#newDeliveryPrice').val();
    newDeliverySchedule = [];
    var newDeliveryScheduleSelect = document.getElementById('newDeliverySchedule');
    for (var i = 0; i < newDeliveryScheduleSelect.options.length; i++) {
      if (newDeliveryScheduleSelect.options[i].selected) {
        var cleaned = encodeURIComponent(newDeliveryScheduleSelect.options[i].value);
        newDeliverySchedule.push(cleaned);
      }
    }
    postcodes = getPostcodes()
    var postVars = 'function=runCreate'+
    '&deliveryScheduleName='+deliveryScheduleName +
    '&deliverySchedulePrice='+deliverySchedulePrice +
    '&postcodes='+postcodes +
    '&newDeliverySchedule='+newDeliverySchedule
    req.send(postVars)
    return false
}

function build_rounds(all_rounds)
    {
        $.each(all_rounds, function(index, value){
        console.log(value)
    })
}

function initialLoad(){
    $('#createSuccessMessage').addClass('d-none')
    $('#deleteSuccessMessage').addClass('d-none')
    $('#runDelete').addClass('d-none')
    $('#runCreate').addClass('d-none')
    $('#postcodesSelect').addClass('d-none')
    $('#createDeliveryScheduleDiv').addClass('d-none')
    $.ajax({
      type: 'POST',
      url: "/postcodes",
      data: {'function': 'initialLoad'},
      dataType: "text",
      success: function(data){
                data = JSON.parse(data)
                all_rounds = data['data']['all_rounds']
                buildSelect(all_rounds, '#deliveryScheduleSelect')
                buildSelect(all_rounds, '#deleteScheduleSelect')
                buildSelect(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], '#newDeliverySchedule')
                buildSelect(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], '#updateDeliverySchedule')
                buildSelect(data['data']['postcode_districts'], '#postcodeSelect')
               }
    });
};

function loadDeliverySchedule(){
    var req = new XMLHttpRequest()
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status != 200)
            {
                //error handling code here
            }
            else
            {
                var response = JSON.parse(req.responseText)
                console.log(response)
                postcodes = response['data']['postcodes']
                $('#postcodeSelect').val(postcodes);
                $('#postcodeSelect').trigger('change');
                deliveryDays = response['data']['delivery_days_string_list']
                $('#updateDeliverySchedule').val(deliveryDays);
                $('#updateDeliverySchedule').trigger('change');
                $('#modifyDeliveryScheduleValuesDiv').removeClass('d-none')
                $('#postcodesSelect').removeClass('d-none')
                $('#runUpdate').removeClass('d-none')
                $('#modifyDeliveryPrice').val(response['data']['cost_list'][0]/100)
                $('#modifyDeliveryName').val(scheduleSelected)
            }
        }
    }
    req.open('POST', '/postcodes')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    scheduleSelected = $('#deliveryScheduleSelect').select2('data')[0]['text']
    console.log(scheduleSelected)
    var postVars = 'function=loadDeliverySchedule'+
    '&scheduleSelected='+scheduleSelected
    req.send(postVars)
    return false
}

$('#deliveryScheduleSelect').on('select2:select', function (e) {
    loadDeliverySchedule();
});

$('#deleteScheduleSelect').on('select2:select', function (e) {
    $('#runDelete').removeClass('d-none')
});

function createRoutSelected(){
    console.log('create route')
    clearAllPostcodes();
    $('#modifyDeliveryScheduleDiv').addClass('d-none')
    $('#runCreate').removeClass('d-none')
    $('#createDeliveryScheduleDiv').removeClass('d-none')
    $('#postcodesSelect').removeClass('d-none')
    $('#runDelete').addClass('d-none')
    $('#modifyDeliveryScheduleValuesDiv').addClass('d-none')
    $('#runUpdate').addClass('d-none')
    $('#deleteDeliveryScheduleDiv').addClass('d-none')
}

function modifyRouteSelected(){
    console.log('modify route')
    clearAllPostcodes()
    $('#modifyDeliveryScheduleDiv').removeClass('d-none')
    $('#runCreate').addClass('d-none')
    $('#postcodesSelect').addClass('d-none')
    $('#createDeliveryScheduleDiv').addClass('d-none')
    $('#deleteDeliveryScheduleDiv').addClass('d-none')
    $('#runDelete').addClass('d-none')
}

function deleteRoute(){
    $('#modifyDeliveryScheduleDiv').addClass('d-none')
    $('#runCreate').addClass('d-none')
    $('#postcodesSelect').addClass('d-none')
    $('#createDeliveryScheduleDiv').addClass('d-none')
    $('#runUpdate').addClass('d-none')
    $('#modifyDeliveryScheduleValuesDiv').addClass('d-none')
    $('#deleteDeliveryScheduleDiv').removeClass('d-none')
}

function runDelete(){
    clearAllPostcodes()
    var req = new XMLHttpRequest()
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status != 200)
            {
                //error handling code here
            }
            else
            {
                var response = JSON.parse(req.responseText)
                $('#deleteDeliveryScheduleDiv').addClass('d-none')
                if (response['response'] == 'success')
                {
                    console.log('successful delete')
                    $('#deleteSuccessMessage').removeClass('d-none')
                    setTimeout(() => {  initialLoad(); }, 2000);
                    initialLoad()

                }
            }
        }
    }
    req.open('POST', '/postcodes')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    scheduleSelected = $('#deleteScheduleSelect').select2('data')[0]['text']
    var postVars = 'function=runDelete'+
    '&scheduleSelected='+scheduleSelected
    req.send(postVars)
    return false
}

window.addEventListener("load", function(){
    initSelect()
    initialLoad()
});
