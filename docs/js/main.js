// Data structure

var data = {
  brzycki: {
    name: "General A",
    formula: "Brzycki"
  },
  epley: {
    name: "General B",
    formula: "Epley",
  },
  lander: {
    name: "General C",
    formula: "Lander"
  },
  nscabench: {
    name: "NSCA Bench",
    formula: "NSCA Bench"
  },
  nscadeadlift: {
    name: "NSCA Deadlift",
    formula: "NSCA Deadlift"
  },
  nscasquat: {
    name: "NSCA Squat",
    formula: "NSCA Squat"
  },
};

// Chart

var chartRepsWeight = null;

function doChart(repData1, repData2, repData3) {

  var data = {
      labels: ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"],
      datasets: [ {
        label: "Brzycki",
        fill: false,
        backgroundColor: "rgba(22, 160, 133, 0.4)",
        borderColor: "rgb(22, 160, 133)",
        borderCapStyle: 'butt',
        data: repData1,
      },
      {
        label: "Epley",
        fill: false,
        backgroundColor: "rgba(44, 62, 80, 0.4)",
        borderColor: "rgb(44, 62, 80)",
        borderCapStyle: 'butt',
        data: repData2,
      },
      {
        label: "Lander",
        fill: false,
        backgroundColor: "rgba(231, 76, 60, 0.4)",
        borderColor: "rgb(231, 76, 60)",
        borderCapStyle: 'butt',
        data: repData3,
      }
    ],
  };

  var options = {
      type: 'line',
      data: data,
      options: {
        scales: {
          yAxes: [{
            ticks: {
                beginAtZero:false
            }
          }],
        },
        legend: {
          display: false,
        }
      }
  };

  if (chartRepsWeight != null)
    chartRepsWeight.destroy();

  var ctx = document.getElementById("chartRepsWeight");

  chartRepsWeight = new Chart(ctx, options);

}

squatCoefficients    = [1, 1.0475, 1.13, 1.1575, 1.2, 1.242, 1.284, 1.326, 1.368, 1.41];
benchCoefficients    = [1, 1.035, 1.08, 1.115, 1.15, 1.18, 1.22, 1.255, 1.29, 1.325];
deadliftCoefficients = [1, 1.065, 1.13, 1.147, 1.164, 1.181, 1.198, 1.232, 1.232, 1.24];

function get1RM(weight, reps, method) {

  var rm1 = 0;

  if ( method == "brzycki" ) {
    rm1= weight / (1.0278 - (0.0278 * reps));
  }

  else if ( method == "epley" ) {
    rm1= weight * ( 1 + ( reps / 30));
  }

  else if ( method == "lander" ) {
    rm1= weight / ( 1.013 - ( 0.0267123 * reps ) );
  }

  else if ( method == "nscasquat" ) {
    rm1= weight * squatCoefficients[reps-1];
  }

  else if ( method == "nscabench" ) {
    rm1= weight * benchCoefficients[reps-1];
  }

  else if ( method == "nscadeadlift" ) {
    rm1= weight * deadliftCoefficients[reps-1];
  }

  return(rm1);
}

function calcCoefficients(method) {
  var coefficients = [];

  var n=0;
  while(n < 10) {
    if ( n == 0 )
      coefficients[n] = 1;
    else
      coefficients[n] = get1RM(1,n+1,method);
    n++;
  }

  return(coefficients);
}

function calcPredictions(rm1, method) {

  var estimates = [];
  var coefficients = calcCoefficients(method);

  var n=0;
  while(n < coefficients.length) {
      estimates[n] = (rm1 / coefficients[n]).toFixed(0);
      n++;
  }

  return(estimates);
}

function calcPercentages(rm1) {

  var percents = [50,60,70,75,80,85,90,95]
  var percentages = [];

  var n=0;
  while(n < percents.length) {
      percentages[n] = (rm1 * percents[n]/100).toFixed(0);
      n++;
  }

  return(percentages);
}

function updateCalculations() {
  weight = $("#weightInput").val();
  reps = $("#repsInput").val();
  rm1 = 0;

  if ( reps < 1 && typeof r !== 'number' )
    return;

  rm1 = get1RM(weight, reps, "brzycki");
  data.brzycki.reps = calcPredictions(rm1, "brzycki").slice(0);
  data.brzycki.percentages = calcPercentages(rm1).slice(0);

  rm1 = get1RM(weight, reps, "epley");
  data.epley.reps = calcPredictions(rm1, "epley").slice(0);
  data.epley.percentages = calcPercentages(rm1).slice(0);

  rm1 = get1RM(weight, reps, "lander");
  data.lander.reps = calcPredictions(rm1, "lander").slice(0);
  data.lander.percentages = calcPercentages(rm1).slice(0);

  rm1 = get1RM(weight, reps, "nscabench");
  data.nscabench.reps = calcPredictions(rm1, "nscabench").slice(0);
  data.nscabench.percentages = calcPercentages(rm1).slice(0);

  rm1 = get1RM(weight, reps, "nscasquat");
  data.nscasquat.reps = calcPredictions(rm1, "nscasquat").slice(0);
  data.nscasquat.percentages = calcPercentages(rm1).slice(0);

  rm1 = get1RM(weight, reps, "nscadeadlift");
  data.nscadeadlift.reps = calcPredictions(rm1, "nscadeadlift").slice(0);
  data.nscadeadlift.percentages = calcPercentages(rm1).slice(0);

  // Reverse the outcomes for proper template rendering
  data.brzycki.reps.reverse()
  data.epley.reps.reverse()
  data.lander.reps.reverse()
  data.nscabench.reps.reverse()
  data.nscasquat.reps.reverse()
  data.nscadeadlift.reps.reverse()

  // Create the chart
  doChart(data.brzycki.reps,data.epley.reps,data.lander.reps);

  // Create the tables with templats
  var source   = $("#reps-template").html();
  var template = Handlebars.compile(source);
  $("#calculationsTable").html(template(data));

  var source   = $("#percentages-template").html();
  var template = Handlebars.compile(source);
  $("#percentagesTable").html(template(data));

}

function increaseWeight() {
  weight= $("#weightInput").val();

  weight= parseInt(weight) + 5;
  weight = isNaN(weight) ? 0 : weight;

  $("#weightInput").val(weight);
}

function decreaseWeight() {
  weight= $("#weightInput").val();

  weight= parseInt(weight) - 5;
  weight = isNaN(weight) ? 0 : weight;

  if ( weight > 0 )
    $("#weightInput").val(weight);
}

function increaseReps() {
  reps= $("#repsInput").val();

  reps= parseInt(reps) + 1;
  reps = isNaN(reps) ? 0 : reps;

  if ( reps > 0 && reps <= 10 )
    $("#repsInput").val(reps);
}

function decreaseReps() {
  reps= $("#repsInput").val();

  reps= parseInt(reps) - 1;
  reps = isNaN(reps) ? 0 : reps;

  if ( reps > 0 && reps <= 10 )
    $("#repsInput").val(reps);
}

// Prepare scripts

$(document).ready(function(){

  // On document load
  updateCalculations();

  // On value change

  $('#repsInput').on('input',function(e){
    updateCalculations();
  });

  $('#weightInput').on('input',function(e){
    updateCalculations();
  });

  // Add / remove --> weight / reps
  $('#increase-weight-button').on('click',function(e){ increaseWeight(); updateCalculations(); });
  $('#decrease-weight-button').on('click',function(e){ decreaseWeight(); updateCalculations(); });
  $('#increase-reps-button').on('click',function(e){ increaseReps(); updateCalculations(); });
  $('#decrease-reps-button').on('click',function(e){ decreaseReps(); updateCalculations(); });

});
