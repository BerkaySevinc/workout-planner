// timer.js — drift-corrected countdown timer

export class CountdownTimer {
  constructor(durationSeconds, onTick, onComplete) {
    this._durationSeconds = durationSeconds;
    this._onTick = onTick;
    this._onComplete = onComplete;
    this._intervalId = null;
    this._endTime = null;
    this._boundVisibility = this._handleVisibility.bind(this);
  }

  start() {
    this._endTime = Date.now() + this._durationSeconds * 1000;
    this._onTick(this._durationSeconds);
    this._intervalId = setInterval(function () { this._tick(); }.bind(this), 100);
    document.addEventListener('visibilitychange', this._boundVisibility);
  }

  stop() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  destroy() {
    this.stop();
    document.removeEventListener('visibilitychange', this._boundVisibility);
  }

  _tick() {
    const remaining = this._endTime - Date.now();
    if (remaining <= 0) {
      this.stop();
      this._onTick(0);
      this._onComplete();
    } else {
      this._onTick(Math.ceil(remaining / 1000));
    }
  }

  _handleVisibility() {
    if (document.hidden) return;
    const remaining = this._endTime - Date.now();
    if (remaining <= 0) {
      this.stop();
      this._onTick(0);
      this._onComplete();
    } else {
      this._onTick(Math.ceil(remaining / 1000));
    }
  }
}
