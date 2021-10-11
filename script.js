'use strict';
//prettier-ignore
const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // An array [lan , lun]
    this.distance = distance; // km
    this.duration = duration; // min
  }

  _dateDescription() {
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} On ${
      months[this.date.getMonth()]
    } ${this.date.getDay()}`;
    return this.description;
  }
}

class running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._dateDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcElevationGain();
    this._dateDescription();
  }
  calcElevationGain() {
    this.ElevationGain = this.distance / (this.duration / 60);
    return this.ElevationGain;
  }
}
// const run1 = new running([35.5, 10], 5.7, 30, 57);
// const cycling21 = new cycling([50, 10], 20, 20, 50);
// console.log(run1, cycling21);
class AppMathods {
  #map;
  #element;
  #html;
  #workoutArray = [];
  #workOutObject;
  #click = 0;
  #mapZoom = 13;
  constructor() {
    this._getLocation();
    form.addEventListener(
      'submit',
      this._submitFormAndDisplayMarker.bind(this)
    );
    inputType.addEventListener('change', this._ToggleFormType);
    containerWorkouts.addEventListener(
      'click',
      this._addScreenToPopup.bind(this)
    );
    this._countClicks();
    this._restoreFromLocalStorage();
  }
  _getLocation() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),

      function () {
        alert(
          'Sorry We are faild to Get your Location. Your map may not work parfectly'
        );
      }
    );
  }

  _loadMap(position) {
    // console.log(position);
    const { latitude, longitude } = position.coords;
    const location = `https://www.google.com/maps/@${latitude},${longitude}`;
    // console.log(location);
    this.#map = L.map('map').setView([latitude, longitude], this.#mapZoom);
    this.#map.on('click', this._displayForm.bind(this));
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#workoutArray.forEach(data => {
      console.log(data);
      this._displaymap(data);
    });
  }
  _countClicks() {
    this.click = this.#click++;
  }
  _displayForm(el) {
    this.#element = el;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    //reset input values
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  _submitFormAndDisplayMarker(e) {
    const checkValidation = (...inputValue) =>
      inputValue.every(inp => Number.isFinite(inp));
    const checkPositive = (...inputs) => inputs.every(inp => inp > 0);
    e.preventDefault();
    //select valued
    const selectType = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#element.latlng;
    //if running active then create running object
    if (selectType === 'running') {
      const cadence = +inputCadence.value;
      // console.log(distance , duration , cadence);
      // check if the value is valid
      if (
        !checkValidation(distance, duration, cadence) ||
        !checkPositive(distance, duration, cadence)
      )
        return alert('Please Input A Positive Number');
      this.#workOutObject = new running(
        [lat, lng],
        distance,
        duration,
        cadence
      );
      // console.log(workoutObject);
    }

    //if cycling active then add cycling object
    if (selectType === 'cycling') {
      const elevationGain = +inputElevation.value;
      // check if the value is valid
      if (
        !checkValidation(distance, duration, elevationGain) ||
        !checkPositive(distance, duration)
      )
        return alert('Please Input A Positive Number');
      this.#workOutObject = new cycling(
        [lat, lng],
        distance,
        duration,
        elevationGain
      );
    }
    // console.log(selectType , distance , duration , cadence , elevationGain );
    //push creted object to object array
    // console.log(workoutObject);
    this.#workoutArray.push(this.#workOutObject);
    this._hideForm();
    // console.log(this.#element);
    this._displaymap(this.#workOutObject);
    this._renderForm(this.#workOutObject);

    this._addToLocalStorage();
  }
  _displaymap(object) {
    L.marker(object.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${object.type}-popup`,
        })
      )
      .setPopupContent(
        `${object.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${object.description} `
      )
      .openPopup();
  }
  _renderForm(workout) {
    this.#html = `
          <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
`;

    if (workout.type === 'running') {
      this.#html += ` <div class="workout__details">
                        <span class="workout__icon">⚡️</span>
                        <span class="workout__value">${workout.pace.toFixed(
                          1
                        )}</span>
                        <span class="workout__unit">min/km</span>
                    </div>
                    <div class="workout__details">
                        <span class="workout__icon">🦶🏼</span>
                        <span class="workout__value">${workout.cadence}</span>
                        <span class="workout__unit">spm</span>
                    </div>
        </li>`;
    }

    if (workout.type === 'cycling') {
      this.#html += `<div class="workout__details">
                        <span class="workout__icon">⚡️</span>
                        <span class="workout__value">${workout.ElevationGain.toFixed(
                          1
                        )}</span>
                        <span class="workout__unit">km/h</span>
                      </div>
                      <div class="workout__details">
                        <span class="workout__icon">⛰</span>
                        <span class="workout__value">${
                          workout.elevationGain
                        }</span>
                        <span class="workout__unit">m</span>
                      </div>
                    </li>`;
    }
    form.insertAdjacentHTML('afterend', this.#html);
  }

  _ToggleFormType() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _addScreenToPopup(e) {
    const workout = e.target.closest('.workout');
    if (!workout) return;
    // console.log(this);
    const selectedArray = this.#workoutArray.find(
      el => el.id === workout.dataset.id
    );
    this.#map.setView(selectedArray.coords, this.#mapZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    this._countClicks();
  }
  _addToLocalStorage() {
    localStorage.setItem('workout', JSON.stringify(this.#workoutArray));
  }
  _restoreFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workout'));
    if (!data) return;
    this.#workoutArray = data;
    console.log(this.#workoutArray);
    this.#workoutArray.forEach(data => {
      this._renderForm(data);
    });
  }
  resetForm() {
    localStorage.removeItem('workout');
    location.reload();
  }
}
const app = new AppMathods();
