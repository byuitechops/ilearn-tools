/*eslint-env browser*/
/*global chrome*/
var script;
var daylight = document.querySelector('body').classList.contains('daylight');

function executeOptions(removeWidgets, showOnCourse, showGrades) {

  if (typeof top.location.pathname.split('/')[3] === 'undefined') {
    if (removeWidgets) {
      console.log(removeWidgets)
      var courses, calendar
      if (daylight) {
        calendar = document.querySelector('.homepage-col-4 .d2l-widget:nth-child(2)').parentElement.parentElement.parentElement.parentElement;
        console.log(calendar)
        calendar.parentElement.removeChild(calendar)
      } else {
        courses = document.querySelectorAll('[title="Collapse My Courses"]')[1].parentElement.parentElement.parentElement.parentElement;
        calendar = document.querySelectorAll('[title="Actions for Calendar"]')[0].parentElement.parentElement.parentElement
        console.log(courses)
        console.log(calendar)
        /* Delete redundant modules if you choose */
        courses.parentElement.removeChild(courses)
        calendar.parentElement.removeChild(calendar)
      }

    }

    /* Add Upcoming Assignments Widget */
    var upXhr = new XMLHttpRequest();
    upXhr.open("GET", chrome.extension.getURL('upcoming.html'));
    upXhr.onload = function () {
      if (upXhr.status == 200) {
        var upcoming = upXhr.response;
        if (daylight) {
          document.querySelector('.homepage-col-8').insertAdjacentHTML('afterbegin', upcoming);
        } else {
          document.querySelector('.d2l-homepage .d2l-box:nth-child(1)').insertAdjacentHTML('afterbegin', upcoming);
        }
      }
    }
    upXhr.send();

    console.log(showGrades)
    if (showGrades) {
      console.log("readech")
      /* Add Recent Grades Widget */
      var gradesXhr = new XMLHttpRequest();
      gradesXhr.open("GET", chrome.extension.getURL('grades.html'));
      gradesXhr.onload = function (e) {
        if (gradesXhr.status == 200) {
          var grades = gradesXhr.response;
          document.querySelector('.d2l-homepage .d2l-box:nth-child(2)').insertAdjacentHTML('afterbegin', grades);
        } else {
          console.log(e);
        }
      }
      gradesXhr.send();
    }

    /*Insert Script*/
    script = document.createElement('script');
    script.src = chrome.extension.getURL('upcoming.js');
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  } else {

    if (showOnCourse) {
      /* Add Upcoming Assignments Widget */
      var upXhr = new XMLHttpRequest();
      upXhr.open("GET", chrome.extension.getURL('upcoming.html'));
      upXhr.onload = function () {
        if (upXhr.status == 200) {
          var upcoming = upXhr.response;
          document.querySelector('.d2l-homepage .d2l-box:nth-child(1)').insertAdjacentHTML('afterbegin', upcoming);
        }
      }

      upXhr.send();
      /*Insert Script*/
      script = document.createElement('script');
      script.src = chrome.extension.getURL('upcoming.js');
      script.onload = function () {
        this.remove();
      };
      (document.head || document.documentElement).appendChild(script);
    }

  }

}

if (top.location.pathname.split('/')[4] == 'my_grades') {

  document.querySelector('form').style = "position: relative";
  document.querySelector('form').insertAdjacentHTML('afterbegin', "<a id='whatif' class='dhdg_1 vui-heading-2' style='position: absolute; right: 0; font-size: 1.5em; background: #326ba9; color: #fff; padding: 8px 10px; border-radius: 5px;' onclick=whatIf() href='#'>What if?</a>");

  var windowUrl = chrome.extension.getURL('window.html');
  xhr = new XMLHttpRequest();
  var whatIfWindow;
  xhr.open("GET", windowUrl);
  xhr.onload = function () {
    if (xhr.status == 200) {
      whatIfWindow = xhr.response;
      document.querySelector('#d2l_body').insertAdjacentHTML('beforeend', whatIfWindow);
    }

  }
  xhr.send();

  script = document.createElement('script');
  script.src = chrome.extension.getURL('scripts.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);

} else if (top.location.pathname.split('/')[2] == 'home') {

  var removeWidgets, showOnCourse, showGrades, moreSpacing;
  chrome.storage.sync.get({
    days: 7,
    moreSpacing: false,
    removeWidgets: true,
    showOnCourse: true,
    showGrades: true
  }, function (items) {
    localStorage['d2l_daysToShow'] = JSON.stringify(items.days);
    localStorage['d2l_moreSpacing'] = JSON.stringify(items.moreSpacing);
    removeWidgets = items.removeWidgets;
    showOnCourse = items.showOnCourse;
    showGrades = items.showGrades;
    if (!daylight) {
      executeOptions(removeWidgets, showOnCourse, showGrades)
    }
  });
  if (daylight) {
    executeOptions(removeWidgets, showOnCourse, showGrades)
  }
  /*Insert jQuery*/
  script = document.createElement('script');
  script.src = chrome.extension.getURL('jquery-3.2.1.min.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}
