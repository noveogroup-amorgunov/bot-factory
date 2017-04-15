var currentStep = 0;

function one(next) {
  console.log('one function is called, currentStep: ' + currentStep);
  
  next();
}

function two(next) {
  console.log('two function is called, currentStep: ' + currentStep);
  next();
}

function three(next) {
  console.log('three function is called, currentStep: ' + currentStep);
  //next();
}

function four(next) {
  console.log('four function is called, currentStep: ' + currentStep);
  next();
}


var acc = [one,two,three, four];




function endDialog() {
  currentStep = 0;
  console.log('end dialog');
}

function beginDialog() {
  if (currentStep !== 0 && acc[currentStep + 1]) {
    acc[currentStep + 1](goToNextCard());
  } else {
    acc[currentStep](goToNextCard());
  }
 
}

function goToNextCard() {
  currentStep++;
  return function() {
    if (typeof acc[currentStep] === 'function') {
      acc[currentStep](goToNextCard());
    } else {
      endDialog();
    }
    
  };
}


beginDialog();
console.log('currentStep: ' + currentStep);
beginDialog();
console.log('currentStep: ' + currentStep);