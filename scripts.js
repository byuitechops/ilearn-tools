/*eslint-env browser*/
var ou = top.location.search.split('=')[1],
  num = 0,
  den = 0;

function whatIf() {
  document.getElementById('whatIfCont').classList.toggle("hidden");
  document.getElementById('whatIfCont').classList.toggle("visible");
  document.querySelector('body').classList.toggle('disabled');
  if (document.getElementById('grade').innerText == "") {
    getSetup();
  }
}

function getSetup() {
  var setup;
  var setupxhr = new XMLHttpRequest();
  setupxhr.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/setup/");
  setupxhr.onload = function () {
    if (setupxhr.status == 200) {
      setup = JSON.parse(setupxhr.response).GradingSystem;
      getGradeObjs(setup, ou);
    }
  }
  setupxhr.send();
}


function getGradeObjs(setup, ou) {
  var grades;
  var gradesxhr = new XMLHttpRequest();
  gradesxhr.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/values/myGradeValues/");
  gradesxhr.onload = function () {
    if (gradesxhr.status == 200) {
      grades = JSON.parse(gradesxhr.response);
      if (setup == "Weighted") {
        weightedOps(grades, ou);
      } else if (setup == "Points") {
        pointsOps(grades, ou);
      }
    }
  }
  gradesxhr.send();
}

function weightedOps(grades, ou) {
  document.getElementById('whatIf').classList.add('weighted');
  document.getElementById('close').insertAdjacentHTML('beforebegin', "<p class='alert'>Attention! Calculations for weighted gradebooks are still under development, and should not be trusted.</p>");
  var catxhr = new XMLHttpRequest();
  catxhr.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/categories/");
  catxhr.onload = function () {
    if (catxhr.status == 200) {
      var catgs = JSON.parse(catxhr.response);
      catgs.forEach(function (catg) {
        catg.Grades.forEach(function (gradeobj) {
          /* Get the earned value and insert */
          var value;
          gradeobj.gValueObj = grades.filter(function (grade) {
            return grade.GradeObjectIdentifier == gradeobj.Id;
          })[0];
          /* Popluate Table */
          gradeobj.FinalWeight = (gradeobj.Weight) * (catg.Weight) / 100;
          if (gradeobj.gValueObj != null) {
            gradeobj.Earned = gradeobj.gValueObj.PointsNumerator;
            value = Math.round(gradeobj.Earned * 100) / 100;
            num += Math.round((gradeobj.Earned / gradeobj.MaxPoints) * 10) / 10 * gradeobj.FinalWeight;
            if (gradeobj.IsBonus === false) {
              den += gradeobj.FinalWeight;
            }
          } else {
            value = "<input class ='newGrade' type='number' onKeyUp='updateGrade()' " + "data-weight='" + gradeobj.FinalWeight + "'>"
          }
          insertRows(gradeobj, value);
        });
      });
      localStorage.setItem('num', num);
      localStorage.setItem('den', den);
      setGrade(num, den);
    }
  }
  catxhr.send();
}

function pointsOps(grades, ou) {
  var gradeobjs;
  var gradeobjxhr = new XMLHttpRequest();
  gradeobjxhr.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/");
  gradeobjxhr.onload = function () {
    if (gradeobjxhr.status == 200) {
      gradeobjs = JSON.parse(gradeobjxhr.response);
      gradeobjs.forEach(function (obj) {
        var value;
        value = grades.filter(function (grade) {
          return grade.GradeObjectIdentifier == obj.Id
        })[0];
        if (value != null) {
          num += value.PointsNumerator;
          if (obj.IsBonus === false) {
            den += value.PointsDenominator;
          }
          value = value.PointsNumerator;
        } else {
          value = "<input class ='newGrade' type='number' onKeyUp='updateGrade()'>"
        }
        insertRows(obj, value);
      })
      setGrade(num, den);
    }
  }
  gradeobjxhr.send();
}

function insertRows(obj, value) {
  if (obj.IsBonus === false) {
    document.querySelector('#whatIf tbody').insertAdjacentHTML('beforeend', "<tr> <td>" + obj.Name + "</td> <td class='value'>" + value + " / " + obj.MaxPoints + "</td> </tr>");
  } else {
    document.querySelector('#whatIf tbody').insertAdjacentHTML('beforeend', "<tr> <td>" + obj.Name + "</td> <td class='value extra'>" + value + " / " + obj.MaxPoints + "</td> </tr>");
  }
}

function calcWeighted(num, den) {
  document.querySelectorAll('.newGrade').forEach(function (input) {
    if (!input.parentNode.classList.contains('extra') && input.value != "") {
      den += Number(input.getAttribute('data-weight'));
    }
    if (input.value != "") {
      num += (Number(input.value) / Number(input.parentNode.innerText.split('/')[1]) * Number(input.getAttribute('data-weight')));
    }
  });
  setGrade(num, den);
}

function updateGrade() {
  var num = Number(localStorage.getItem('num'));
  var den = Number(localStorage.getItem('den'));
  if (document.getElementById('whatIf').classList.contains('weighted')) {
    calcWeighted(num, den);
  } else {
    document.querySelectorAll('.newGrade').forEach(function (value) {
      if (!value.parentNode.classList.contains('extra') && value.value != "") {
        den += Number(value.parentNode.innerText.split('/')[1]);
      }
      num += Number(value.value);
    });
    setGrade(num, den);
  }
}

function setGrade(num, den) {
  document.getElementById('num').innerHTML = Math.round(num * 10) / 10;
  document.getElementById('den').innerHTML = Math.round(den * 10) / 10;
  document.getElementById('perc').innerText = Math.round(num / den * 1000) / 10;
  document.getElementById('grade').innerText = getGrade((num / den));
}

function getGrade(perc) {
  if (perc >= .93) {
    return "A";
  } else if (perc >= .90) {
    return "A-";
  } else if (perc >= .87) {
    return "B+";
  } else if (perc >= .83) {
    return "B";
  } else if (perc >= .80) {
    return "B-";
  } else if (perc >= .77) {
    return "C+";
  } else if (perc >= .73) {
    return "C";
  } else if (perc >= .70) {
    return "C-";
  } else if (perc >= .67) {
    return "D+";
  } else if (perc >= .63) {
    return "D";
  } else if (perc >= .60) {
    return "D-";
  } else return "F"
}

function closeWhatIf() {
  document.getElementById('whatIfCont').classList.toggle("hidden");
  document.getElementById('whatIfCont').classList.toggle("visible");
  document.querySelector('body').classList.toggle('disabled');
}
