// Coefficients
squatCoefficients    = [1, 1.0475, 1.130, 1.1575, 1.200, 1.242, 1.284, 1.326, 1.368, 1.410];
benchCoefficients    = [1, 1.0350, 1.080, 1.1150, 1.150, 1.180, 1.220, 1.255, 1.290, 1.325];
deadliftCoefficients = [1, 1.0650, 1.130, 1.1470, 1.164, 1.181, 1.198, 1.232, 1.232, 1.240];

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

  return rm1;
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

var percents = [100,95,90,85,80,75,50,65,60,50];

var repsdata = {
  data: {
    reps: [
      [1,  0, 0, 0],
      [2,  0, 0, 0],
      [3,  0, 0, 0],
      [4,  0, 0, 0],
      [5,  0, 0, 0],
      [6,  0, 0, 0],
      [7,  0, 0, 0],
      [8,  0, 0, 0],
      [9,  0, 0, 0],
      [10, 0, 0, 0]
    ],
    percentages: [
      ['100%', 0,0,0],
      ['95%',  0,0,0],
      ['90%',  0,0,0],
      ['85%',  0,0,0],
      ['80%',  0,0,0],
      ['75%',  0,0,0],
      ['70%',  0,0,0],
      ['65%',  0,0,0],
      ['60%',  0,0,0],
      ['50%',  0,0,0]
    ]
  }
};

function updateData(weight, reps) {
  var brzycki_c = calcCoefficients("brzycki");
  var epley_c = calcCoefficients("epley");
  var lander_c = calcCoefficients("lander");
  var brzycki_1rm = get1RM(weight, reps, "brzycki");
  var epley_1rm = get1RM(weight, reps, "brzycki");
  var lander_1rm = get1RM(weight, reps, "brzycki");

  for (i = 0; i < repsdata.data.reps.length; i++) {
    repsdata.data.reps[i][1]=(brzycki_1rm / brzycki_c[i]).toFixed(0);
    repsdata.data.reps[i][2]=(epley_1rm / epley_c[i]).toFixed(0);
    repsdata.data.reps[i][3]=(lander_1rm / lander_c[i]).toFixed(0);
  }

  for (i = 0; i < repsdata.data.percentages.length; i++) {
    repsdata.data.percentages[i][1]=(brzycki_1rm * percents[i]/100).toFixed(0);
    repsdata.data.percentages[i][2]=(epley_1rm * percents[i]/100).toFixed(0);
    repsdata.data.percentages[i][3]=(lander_1rm * percents[i]/100).toFixed(0);
  }
  
}

var chartdata = {
  // A labels array that can contain any sort of values
  labels: [10,9,8,7,6,5,4,3,2,1],
  // Our series array that contains series objects or in this case series data arrays
  series: [

  ]
};

var chart = null;

function updateChartData() {

  chartdata.series = [];

  for (n = 0; n < 3; n++) {
    var arr = [];
    for (i=0; i < repsdata.data.reps.length; i++) {
      arr.push(repsdata.data.reps[i][n+1]);
    }
    chartdata.series.push(arr.reverse());
  }

}

function updateCalculations() {
  weight = $("#weightInput").val();
  reps = $("#repsInput").val();
  rm1 = 0;

  if ( reps < 1 && typeof r !== 'number' )
    return;
  
  updateData(weight, reps);
  updateChartData();

  chart = new Chartist.Line('.ct-chart', chartdata);

  // Create the tables with templates
  var source   = $("#reps-template").html();
  var template = Handlebars.compile(source);
  $("#calculationsTable").html(template(repsdata));

  var source   = $("#percentages-template").html();
  var template = Handlebars.compile(source);
  $("#percentagesTable").html(template(repsdata));
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

function showOverlay() {
  document.getElementById("overlay").style.display = "block";
}

function hideOverlay() {
  document.getElementById("overlay").style.display = "none";
}

// Prepare scripts

$(document).ready(function(){

  // On document load
  updateCalculations();

  // On input value change

  $('#repsInput').on('input',function(e){
    updateCalculations();
  });

  $('#weightInput').on('input',function(e){
    updateCalculations();
  });

  // Button click handlers
  
  $('#increase-weight-button').on('click',function(e){ increaseWeight(); updateCalculations(); });
  $('#decrease-weight-button').on('click',function(e){ decreaseWeight(); updateCalculations(); });
  $('#increase-reps-button').on('click',function(e){ increaseReps(); updateCalculations(); });
  $('#decrease-reps-button').on('click',function(e){ decreaseReps(); updateCalculations(); });

});
