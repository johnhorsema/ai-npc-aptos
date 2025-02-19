class TimedQueue {
  constructor() {
    this.queue = []; // array to hold functions
    this.task = null; // the next task to run
    this.tHandle = null; // To stop pending timeout
    this.done = true; // state flag
    this.callback = null;
  }

  next() {
    if (this.task !== null) {
      // is task scheduled??
      this.task.func(); // run it
      this.task = null; // clear task
    }
    if (this.queue.length > 0) {
      // are there any remaining tasks??
      this.task = this.queue.shift(); // yes, set as next task
      this.tHandle = setTimeout(this.next.bind(this), this.task.time); // schedule next
    } else {
      this.done = true;
      if (typeof this.callback === 'function') {
        // if a callback function is defined, execute it
        this.callback();
      }
    }
  }

  add(func, time) {
    this.queue.push({ func: func, time: time });
  }

  start() {
    if (this.queue.length > 0 && this.done) {
      this.done = false; // set state flag
      this.tHandle = setTimeout(this.next.bind(this), 0);
    }
  }

  clear() {
    this.task = null; // remove pending task
    this.queue.length = 0; // empty queue
    clearTimeout(this.tHandle); // clear timeout
    this.done = true; // set state flag
  }

  setCallback(callback) {
    this.callback = callback;
  }
}

export default TimedQueue;
