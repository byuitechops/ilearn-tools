/*eslint-env browser*/
var classes;
var displaylimit = 15;
var ou = top.location.pathname.split('/')[3];
var currDate = new Date();
var startDate = new Date(currDate);
startDate.setDate(startDate.getDate() - 120);
var endDate = new Date(currDate);
endDate.setDate(endDate.getDate() + 120);
var itemsStartDate = new Date(currDate);
itemsStartDate.setDate(itemsStartDate.getDate() - 7);
var amountOverLimit = 0;

if (typeof (ou) != 'undefined') {
    if (ou != "6606") {
        var cclass = [{
            Id: ou
    }];
        document.getElementById('upcoming').classList.add('singleCourse');
        getItems(cclass);
    } else {
        getEnrollments();
    }
} else {
    getEnrollments();
}

function getCourse(courseId, courses) {
    var name = courses.filter(function (course) {
        return course.Id == courseId;
    })[0].Name
    if (typeof (name) == 'undefined') {
        return "";
    } else {
        return "<td><a href=/d2l/home/" + courseId + " title='" + name + "'>" + name + "</a></td>";
    }
}

function getCourseIds(courses) {
    var string = "";
    courses.forEach(function (item) {
        string += item.Id + ",";
    })
    return string;
}

function getItems(classes) {
    var items;
    var itemsxhr = new XMLHttpRequest();
    itemsxhr.open("GET", "/d2l/api/le/1.18/content/myItems/?completion=3&orgUnitIdsCSV=" + getCourseIds(classes) + "&startDateTime=" + itemsStartDate.toISOString());
    itemsxhr.onload = function () {
        if (itemsxhr.status == 200) {
            items = JSON.parse(itemsxhr.response);


            for (var i = 0; i < items.Objects.length; i++) {

                var itemClass = "";
                if (items.Objects[i].DueDate === null) {
                    if (items.Objects[i].EndDate === null) {
                        items.Objects[i].DueDate = items.Objects[i].StartDate;
                        items.Objects[i].IsAvailability = true;
                        itemClass = "available"
                    } else {
                        items.Objects[i].DueDate = items.Objects[i].EndDate;
                    }
                }
                if (Date.parse(items.Objects[i].DueDate) - currDate < 0) {
                    if (items.Objects[i].IsAvailability) {
                        itemClass = "hidden";
                    } else {
                        itemClass = "late";
                    }
                }
                if (i > displaylimit){
                    itemClass= "overlimit";
                    amountOverLimit++;
                }

                var itemRow = "<tr id='upcomingRow" + i + "' class=" + itemClass + "><th onclick='hideRow("+i+")'> &ndash; </th><th><a href=" + items.Objects[i].ItemUrl + " title='" + items.Objects[i].ItemName + "'>" + items.Objects[i].ItemName + "</a></th>" + getCourse(items.Objects[i].OrgUnitId, classes) + "<td>" + new Date(Date.parse(items.Objects[i].DueDate)).toLocaleString() + "</td></tr>";
                document.getElementById('upcomingTbody').insertAdjacentHTML('beforeend', itemRow)
            }
            if (amountOverLimit > 0){
            document.getElementById('upcoming').insertAdjacentHTML('beforeend', "<p id='overLimitMsg' onclick='unhideUpcoming()'>" + (amountOverLimit) + " upcoming assignments hidden. Click to show all.</p>")}
            document.getElementById('upcoming').insertAdjacentHTML('beforeend', "<p>*Assignments more that one week overdue are ommited. Quizzes with unlimited attempts will not disappear after completion</p>")
        }
    }
    itemsxhr.send();
}

function unhideUpcoming(){
    var overLimitRows = document.querySelectorAll(".overlimit");
    console.log(overLimitRows.length);
    overLimitRows.forEach(function(row){
        row.classList.remove("overlimit");
    })
    document.getElementById("overLimitMsg").classList.add("overlimit");
}

function getEnrollments() {
    var classesxhr = new XMLHttpRequest();
    classesxhr.open("GET", "/d2l/api/lp/1.9/enrollments/myenrollments/?canAccess=true&orgUnitTypeId=3&startDateTime=" + startDate.toISOString() + "&endDateTime=" + endDate.toISOString());
    classesxhr.onload = function () {
        if (classesxhr.status == 200) {
            classes = JSON.parse(classesxhr.response);
            var filtered = classes.Items.filter(function (value) {
                return Date.parse(value.Access.EndDate) >= currDate
            });
            filtered = filtered.map(function (value) {
                return {
                    Name: value.OrgUnit.Name,
                    Id: value.OrgUnit.Id
                }
            });
            getItems(filtered);

        }
    }
    classesxhr.send();
}

function showHidden(){
    var hiddenElements = document.querySelectorAll(".userHidden");
    hiddenElements.forEach(function (row){
    row.classList.remove("userHidden");
    })
}

function hideRow(rownum){
    console.log("upcomingRow" + rownum);
    console.log(document.querySelector("#upcomingRow" + rownum));
    document.querySelector("#upcomingRow" + rownum).classList.add("userHidden");
}
