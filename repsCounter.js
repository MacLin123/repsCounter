class MainApplication {

    mainPage = new MainPage();
    workoutPage = new WorkoutPage();
    prepareWorkoutPage = new PrepareWorkoutPage();

    initMainPage() {
        this.mainPage.init();
    }

    initWorkoutPage() {
        this.workoutPage.init(this.mainPage.getIntervalMs());
    }

    initPreWorkoutPage() {
        this.prepareWorkoutPage.init();
    }
}

class MainPage {
    intervalElem;
    startBtn;

    intervalMs = 5000;

    viewBuilder = new TemplateBuilder();

    init() {
        this.viewBuilder.displayMainPage();
        this.initElements();
        this.initEventListeners();
        this.updateUI();
    }

    initEventListeners() {
        this.startBtn.addEventListener("click", () => mainApp.initPreWorkoutPage());
        this.intervalElem.addEventListener("change", (event) => this.intervalMs = +this.intervalElem.value * 1000);
    }

    initElements() {
        this.intervalElem = document.querySelector("#intevalId");
        this.startBtn = document.querySelector("#startBtn");
    }

    getIntervalMs() {
        return this.intervalMs;
    }

    updateUI() {
        this.intervalElem.value = this.intervalMs / 1000;
    }
}

class WorkoutPage {
    pauseBtn;
    endWorkoutBtn;

    viewBuilder;
    repsCounter;
    intervalMs;

    prepareWorkoutPage = new PrepareWorkoutPage();

    endWorkoutHidden = true;

    init(intervalMs) {
        this.viewBuilder = new TemplateBuilder();

        this.intervalMs = intervalMs;

        this.viewBuilder.displayWorkoutPage();

        this.initElements();

        this.initEventListeners();

        this.repsCounter = new RepsCounter(this.intervalMs);

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

    getIntervalMs() {
        return this.intervalMs;
    }
}

class PrepareWorkoutPage {

    DEFAULT_PREPARE_TIME_MS = 5000;

    init() {
        this.viewBuilder = new TemplateBuilder();

        this.viewBuilder.displayPrepareWorkoutPage();
        this.displayPrepareTime();

        this.stopwatch = new StopwatchView(new Stopwatch());
        this.stopwatch.startTimer();
        setTimeout(() => mainApp.initWorkoutPage(), this.DEFAULT_PREPARE_TIME_MS);
    }

    displayPrepareTime() {
        document.querySelector("#prepareTime").textContent = `/00:00:${Utils.transformTimeForView(this.DEFAULT_PREPARE_TIME_MS / 1000)}`
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
    intervalMs;
    intervalId;

    stopwatch = new StopwatchView(globalStopwatch);
    repsElem = document.querySelector("#reps");

    constructor(intervalMs) {
        this.intervalMs = intervalMs;
    }

    startCounter() {
        this.updateUI();
        this.stopwatch.startTimer();
        this.doRep();
        this.intervalId = setInterval(this.doRep.bind(this), this.intervalMs);
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

class Utils {
    static transformTimeForView(number) {
        return number < 10 ? `0${number}`: number;
    }
}
  

const mainApp = new MainApplication();
mainApp.initMainPage();

globalCounter = new Counter();

globalStopwatch = new Stopwatch();