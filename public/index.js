
const MIN_DIAMETER = 10;
const MAX_DIAMETER = 100;
const BORDER_WIDTH = 2;

function Dot(width, height, callback) {
  const dot = window.document.createElement('span');
  dot.style.width = `${width}px`;  
  dot.style.height = `${height}px`;
  dot.classList.add('speed-handler');
  dot.addEventListener('click', function() {
    callback(this, 'add');
  });
  dot.addEventListener('animationend', function() {
    callback(this, 'end');
  });
  return dot;
}

class Game {
  constructor() {
    this.main = window.document.querySelector('main');
    this.startButton = window.document.querySelector('#start-button');
    this.pointContainer = window.document.querySelector('#point');
    this.speed = window.document.querySelector('#speed');
    this.added = window.document.querySelector('#added');
    this.styleSheet = window.document.styleSheets[0];
    this.started = false;
    this.counter = 0;
    this.point = 0;
    this.timer = null;
    this.init();
  }
  
  init() {
    this.pointContainer.innerText = 0;
    this.startButton.addEventListener('click', this.trigger.bind(this));
    this.speed.addEventListener('input', this.speedHandler.bind(this));
    window.document.addEventListener('visibilitychange', this.handleVisibilityState.bind(this));
  }
  
  handleVisibilityState() {
    if (window.document.visibilityState === 'hidden' && this.started) {
      this.trigger(); 
    }
  }
  
  trigger() {
    this.started = !this.started;
    
    if (this.started) {
      this.timer = window.setInterval(() => {
        this.drop();
      }, 1000);
      this.startButton.innerText = 'Pause';
    } else {
      window.clearInterval(this.timer);
      this.startButton.innerText = 'Start';
    }
  }
  
  drop() {
    const diameter = parseInt(
      this.getRandomNum(MIN_DIAMETER, MAX_DIAMETER),
      10
    );
    const dot = new Dot(diameter, diameter, this.dotHandler.bind(this));
    const startTranslateX =
      parseInt(
        this.getRandomNum(
          BORDER_WIDTH + diameter,
          this.main.offsetWidth - diameter - BORDER_WIDTH
        ),
        10
      );
    const dotId = `animation-${this.counter}`;
    const animationKeyframe = this.getKeyframe(
      startTranslateX,
      -diameter,
      this.main.offsetHeight,
      dotId
    );
    const point = parseInt(
      (MAX_DIAMETER - diameter) / MIN_DIAMETER
    ) + 1;
    this.counter++;
    dot.id = dotId;
    dot.dataset.point = point;
    dot.style.animationName = `${dotId}, fade-in-and-out`;
    dot.style.animationDuration = `${this.getSecondByElementHeight()}s`;
    dot.style.animationTimingFunction = 'linear';
    dot.style.backgroundColor = this.getRandomHex();
    this.styleSheet.insertRule(animationKeyframe);
    this.main.append(dot);
  }
  
  getSecondByElementHeight(height) {
    if (height) return (this.main.offsetHeight - height) / this.speed.value;
    return this.main.offsetHeight / this.speed.value;
  }
  
  speedHandler() {
    const ruleList = this.styleSheet.cssRules;
    const { x: mainPosX, y: mainPosY } = this.main.getBoundingClientRect();

    for (let i = 0; i < ruleList.length; i++) {
      if (ruleList[i].type === window.CSSRule.KEYFRAMES_RULE && ruleList[i].name) {
        const target = window.document.querySelector(`#${ruleList[i].name}`);
        if (target) {
          const { name } = ruleList[i];
          const { x: childPosX, y: childPosY } = target.getBoundingClientRect();
          const nextDuration = this.getSecondByElementHeight(Math.abs(childPosY - mainPosY) - BORDER_WIDTH);
          const newKeyframe = this.getKeyframe(
            Math.abs(childPosX - mainPosX) - BORDER_WIDTH,
            0 - (Math.abs(childPosY - mainPosY) + parseInt(target.style.width)) - BORDER_WIDTH,
            this.main.offsetHeight,
            name
          );
          this.styleSheet.deleteRule(i);
          this.styleSheet.insertRule(newKeyframe);
          target.style.animationDuration = `${nextDuration}s`;
        }
      }
    }
  }
  
  dotHandler(el, type) {
    const ruleList = this.styleSheet.cssRules;
    const innerPoint = window.document.createElement('div');
    if (type === 'add') {
      this.point += Number(el.dataset.point);
      this.pointContainer.innerText = this.point;
      this.speed.style.backgroundColor = el.style.backgroundColor;
      innerPoint.innerText = `+${Number(el.dataset.point)}`;
      innerPoint.style.animation = 'fade-in-and-out 1s 1 linear forwards';
      this.added.append(innerPoint);
    }
    for (let i = 0; i < ruleList.length; i++) {
      if (ruleList[i].cssText.includes(el.id)) {
        this.styleSheet.deleteRule(i);
        break;
      }
    }
    el.remove();
    window.setTimeout(() => {
      innerPoint.remove();
    }, 1000);
  }
  
  getKeyframe(startX, startY, endY, name) {
    return `
      @keyframes ${name} {
        0% {
          transform: translate(${startX}px, ${startY}px);
        }

        100% {
          transform: translate(${startX}px, ${endY}px);
        }
      }
    `;
  }
  
  getRandomNum(min, max) {
    return Math.random() * (max - min) + min;  
  }
  
  getRandomHex() {
    return `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`;
  }
}

new Game();