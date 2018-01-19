// Coefficients
nscaCoefficients = {
  squat:    [1, 1.0650, 1.130, 1.1470, 1.164, 1.181, 1.198, 1.232, 1.232, 1.240],
  bench:    [1, 1.0475, 1.130, 1.1575, 1.200, 1.242, 1.284, 1.326, 1.368, 1.410],
  deadlift: [1, 1.0350, 1.080, 1.1150, 1.150, 1.180, 1.220, 1.255, 1.290, 1.325]
}

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

  else if ( method == "Squat" ) {
    rm1= weight * nscaCoefficients.squat[reps-1];
  }

  else if ( method == "Bench" ) {
    rm1= weight * nscaCoefficients.bench[reps-1];
  }

  else if ( method == "Deadlift" ) {
    rm1= weight * nscaCoefficients.deadlift[reps-1];
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

var percents = [100,95,90,85,80,75,70,65,60,50];

var repsdata = {
  data: {
    replabels: ['Reps', 'Est A', 'Est B', 'Est C'],
    percentlabels: ['Percent', 'Est A', 'Est B', 'Est C'],
    reps: [],
    percentages: []
  }
};

var nsca = 'No NSCA calculation';

function updateData(weight, reps, nsca) {
  var brzycki_c = calcCoefficients("brzycki");
  var epley_c = calcCoefficients("epley");
  var lander_c = calcCoefficients("lander");
  var brzycki_1rm = get1RM(weight, reps, "brzycki");
  var epley_1rm = get1RM(weight, reps, "epley");
  var lander_1rm = get1RM(weight, reps, "lander");
  
  repsdata.data.reps.splice(0);
  repsdata.data.percentages.splice(0);

  for (i = 0; i < 10; i++) {
    reps1=i+1;
    reps2=(brzycki_1rm / brzycki_c[i]).toFixed(0);
    reps3=(epley_1rm / epley_c[i]).toFixed(0);
    reps4=(lander_1rm / lander_c[i]).toFixed(0);
    
    perc1=percents[i].toFixed(0)+'%';
    perc2=(brzycki_1rm * percents[i]/100).toFixed(0);
    perc3=(epley_1rm * percents[i]/100).toFixed(0);
    perc4=(lander_1rm * percents[i]/100).toFixed(0);

    if (nsca != 'No NSCA calculation') {
      if (nsca == 'Bench')
        reps5=(get1RM(weight, reps, nsca) / nscaCoefficients.bench[i]).toFixed(0);
      else if (nsca == 'Deadlift')
        reps5=(get1RM(weight, reps, nsca) / nscaCoefficients.deadlift[i]).toFixed(0);
      else (nsca == 'Squat')
        reps5=(get1RM(weight, reps, nsca) / nscaCoefficients.squat[i]).toFixed(0);
      
      perc5=(get1RM(weight, reps, nsca) * percents[i]/100).toFixed(0);
      
      repsdata.data.reps.push([reps1,reps2,reps3,reps4, reps5]);
      repsdata.data.percentages.push([perc1,perc2,perc3,perc4, perc5]);
    } 
    else {
      repsdata.data.reps.push([reps1,reps2,reps3,reps4]);
      repsdata.data.percentages.push([perc1,perc2,perc3,perc4]);
    } 
  }

  // Adjust labels
  if (nsca != 'No NSCA calculation') {
    repsdata.data.replabels[4] = nsca.toString();
    repsdata.data.percentlabels[4] = nsca.toString();
  }
  else {
    repsdata.data.replabels.splice(4);
    repsdata.data.percentlabels.splice(4);
  }
}

var chartdata = {
  // A labels array that can contain any sort of values
  labels: [10,9,8,7,6,5,4,3,2,1],
  // Our series array that contains series objects or in this case series data arrays
  series: []
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
  
  updateData(weight, reps, nsca);

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
  updateCalculations();
}

function decreaseWeight() {
  weight= $("#weightInput").val();
  weight= parseInt(weight) - 5;
  weight = isNaN(weight) ? 0 : weight;
  if ( weight > 0 )
    $("#weightInput").val(weight);
    updateCalculations();
}

function increaseReps() {
  reps= $("#repsInput").val();
  reps= parseInt(reps) + 1;
  reps = isNaN(reps) ? 0 : reps;
  if ( reps > 0 && reps <= 10 )
    $("#repsInput").val(reps);
  updateCalculations();
}

function decreaseReps() {
  reps= $("#repsInput").val();
  reps= parseInt(reps) - 1;
  reps = isNaN(reps) ? 0 : reps;
  if ( reps > 0 && reps <= 10 )
    $("#repsInput").val(reps);
    updateCalculations();
}

function showOverlay() {
  document.getElementById("overlay").style.display = "block";
  updateChartData();
  chart = new Chartist.Line('.ct-chart', chartdata);
}

function hideOverlay() {
  document.getElementById("overlay").style.display = "none";
}

function showRepsModal() {
  $('#reps-modal').addClass('is-active');
}

// Prepare scripts

$(document).ready(function(){

  nsca = $('#nsca-selector').val();

  // On document load
  updateCalculations();
  
  // On input value change
  
  $('#repsInput').on('input',function(e){
    updateCalculations();
  });
  
  $('#weightInput').on('input',function(e){
    updateCalculations();
  });
  
  $('#nsca-selector').change(function() {
    nsca=$(this).val();
    updateCalculations();
  });
  
  // Button click handlers
  
  $('#increase-weight-button').on('click',function(e){ increaseWeight(); });
  $('#decrease-weight-button').on('click',function(e){ decreaseWeight(); });
  $('#increase-reps-button').on('click',function(e){ increaseReps(); });
  $('#decrease-reps-button').on('click',function(e){ decreaseReps(); });

});
