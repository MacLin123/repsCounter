class MainApplication {

    mainPage = new MainPage();
    workoutPage = new WorkoutPage();
    prepareWorkoutPage = new PrepareWorkoutPage();

    initMainPage() {
        this.mainPage.init();
    }

    initWorkoutPage() {
        this.workoutPage.init();
    }

    initPreWorkoutPage() {
        this.prepareWorkoutPage.init();
    }
}

class MainPage {
    startBtn;

    viewBuilder = new TemplateBuilder();

    init() {
        this.viewBuilder.displayMainPage();
        this.initElements();
        this.initRanges();
        this.initEventListeners();
    }

    initEventListeners() {
        this.startBtn.addEventListener("click", () => mainApp.initPreWorkoutPage());
    }

    initElements() {
        this.startBtn = document.querySelector("#startBtn");
    }

    initRanges() {
        window.prepareRange = new PrepareTimeRange();
        window.intervalRange = new IntervalRange();
    }
}

class WorkoutPage {
    pauseBtn;
    endWorkoutBtn;

    viewBuilder;
    repsCounter;

    prepareWorkoutPage = new PrepareWorkoutPage();

    endWorkoutHidden = true;

    init() {
        this.viewBuilder = new TemplateBuilder();

        this.viewBuilder.displayWorkoutPage();

        this.initElements();

        this.initEventListeners();

        this.repsCounter = new RepsCounter();

        this.repsCounter.startCounter();
    }

    destroy() {
        this.repsCounter.resetCounter();
        mainApp.initMainPage();
    }

    pauseToggle() {
        if (this.pauseBtn.textContent === "Pause") {
            this.pauseBtn.textContent = "Continue";
            this.repsCounter.pauseCounter();
        } else {
            this.pauseBtn.textContent = "Pause";
            this.prepareWorkoutPage.init();
        }
        this.toggleEndWorkoutHidden();
    }

    toggleEndWorkoutHidden() {
        this.endWorkoutHidden ? this.endWorkoutBtn.removeAttribute("hidden") : this.endWorkoutBtn.setAttribute("hidden", "");
        this.endWorkoutHidden = !this.endWorkoutHidden;
    }

    initElements() {
        this.pauseBtn = document.querySelector("#pauseBtn");
        this.endWorkoutBtn = document.querySelector("#endWorkoutBtn");
    }

    initEventListeners() {
        this.endWorkoutBtn.addEventListener("click", this.destroy.bind(this));
        this.pauseBtn.addEventListener("click", this.pauseToggle.bind(this));
    }
}

class PrepareWorkoutPage {

    init() {
        this.viewBuilder = new TemplateBuilder();

        this.viewBuilder.displayPrepareWorkoutPage();
        this.displayPrepareTime();

        this.stopwatch = new StopwatchView(new Stopwatch());
        this.stopwatch.startTimer();
        setTimeout(() => mainApp.initWorkoutPage(), prepareRange.getValue() * 1000);
    }

    displayPrepareTime() {
        document.querySelector("#prepareTime").textContent = `/00:00:${Utils.transformTimeForView(prepareRange.getValue())}`
    }
}

class Counter {
    count = 0;

    addCount() {
        this.count++;
    }

    getCount() {
        return this.count;
    }

    resetCount() {
        this.count = 0;
    }
}

class RepsCounter {
    intervalId;

    stopwatch = new StopwatchView(globalStopwatch);
    repsElem = document.querySelector("#reps");

    startCounter() {
        this.updateUI();
        this.stopwatch.startTimer();
        this.doRep();
        this.intervalId = setInterval(this.doRep.bind(this), intervalRange.getValue() * 1000);
    }

    doRep() {
        globalCounter.addCount();
        this.updateUI();
        Speaker.speak(`${globalCounter.getCount()}`)
    }

    resetCounter() {
        this.pauseCounter();
        globalCounter.resetCount();
        this.stopwatch.resetTimer();
    }

    pauseCounter() {
        clearInterval(this.intervalId);
        this.stopwatch.pauseTimer();
    }

    updateUI() {
        this.repsElem.textContent = globalCounter.getCount();
    }
}


class Stopwatch {
    DEFAULT_TIME_MS = new Date().setHours(0, 0, 0 ,0);
    timeInMs = this.DEFAULT_TIME_MS;

    getTimeInMs() {
        return this.timeInMs;
    }

    resetTimer() {
        this.timeInMs = this.DEFAULT_TIME_MS;
    }

    addTime(timeInMs) {
        this.timeInMs += timeInMs;   
    }
    
}

class StopwatchView {
    time = document.querySelector("#time")
    interval;
    timeIntervalMs = 1000;

    constructor(stopwatch) {
        this.stopwatch = stopwatch
    }

    getTimeInMs() {
        return this.stopwatch.getTimeInMs();
    }

    pauseTimer() {
        clearInterval(this.interval); 
    }

    resetTimer() {
        clearInterval(this.interval);
        this.stopwatch.resetTimer();
        this.updateView();
    }

    startTimer() {
        this.resetTimer();
        this.interval = setInterval(this.updateTimer.bind(this), this.timeIntervalMs);
    }

    updateTimer() {
        this.stopwatch.addTime(this.timeIntervalMs);
        this.updateView();
    }

    updateView() {
        this.time.innerHTML = this.getCurrentTimeView();
    }

    getCurrentTimeView() {
        const currentDateTime = new Date(this.stopwatch.getTimeInMs());
        const hours = Utils.transformTimeForView(currentDateTime.getHours());
        const minutes = Utils.transformTimeForView(currentDateTime.getMinutes());
        const seconds = Utils.transformTimeForView(currentDateTime.getSeconds());
        return `${hours}:${minutes}:${seconds}`;
    }
    
}

class TemplateBuilder {
    contentElem = document.querySelector(".content");
    mainTemplate = document.querySelector("#mainTemplate");
    workoutTemplate = document.querySelector("#workoutTemplate");
    prepareWorkoutPage = document.querySelector("#prepareWorkoutTemplate");

    clearContent() {
        this.contentElem.innerHTML = "";
    }

    displayTemplate(templateElem) {
        this.clearContent();
        this.contentElem.appendChild(templateElem.content.cloneNode(true));
    }

    displayMainPage() {
        this.displayTemplate(this.mainTemplate);
    }

    displayWorkoutPage() {
        this.displayTemplate(this.workoutTemplate);
    }

    displayPrepareWorkoutPage() {
        this.displayTemplate(this.prepareWorkoutPage);
    }

}

  // todo move to other file

  class Speaker {
    static speak(text) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 4;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    }
}

class Range {
    rangeInput;
    rangeValueElem;
    rangeValue;

    initRange() {
        this.updateValue();
        this.rangeInput.oninput = this.updateValue.bind(this);
    }

    updateValue() {
        this.rangeValue = +this.rangeInput.value;
        this.rangeValueElem.textContent = this.rangeInput.value;
    }

    getValue() {
        return this.rangeValue;
    }
}

class IntervalRange extends Range {
    constructor() {
        super();
        this.rangeInput = document.querySelector("#intevalId");
        this.rangeValueElem = document.querySelector("#intervalValue");
        this.initRange();
    }
}

class PrepareTimeRange extends Range {
    constructor() {
        super();
        this.rangeInput = document.querySelector("#prepareTime");
        this.rangeValueElem = document.querySelector("#prepareTimeValue");
        this.initRange();
    }
}

class Utils {
    static transformTimeForView(number) {
        return number < 10 ? `0${number}`: number;
    }
}
  

const mainApp = new MainApplication();
mainApp.initMainPage();

globalCounter = new Counter();

globalStopwatch = new Stopwatch();