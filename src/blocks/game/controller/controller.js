import constants from '../constants';

class Controller {
  constructor(model, view) {
    this._model = model;
    this._view = view;
  }

  init() {
    this.observeModel().observeView();
    this._model.createGridMatrix(constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT);
    this._isGameRunning = false;
    this._timerId = null;
    this._delay = constants.DEFAULT_DELAY;
  }

  observeModel() {
    this._model.newGameEvent.attach(this.initNewGameView);
    this._model.updateCellEvent.attach(this.updateGridCell);
    this._model.endGameEvent.attach(this.endGame);
    return this;
  }

  observeView() {
    this._view.grid.cellUpdate.attach(this.updateMatrixCell);
    this._view.playButton.click.attach(this.toggleGameStatus);
    this._view.oneStepButton.click.attach(this.updateMatrix);
    this._view.newGameButton.click.attach(this.clearGrid);
    this._view.widthInput.blur.attach(this.changeMatrixWidth);
    this._view.heightInput.blur.attach(this.changeMatrixHeight);
    this._view.delayInput.blur.attach(this.changeDelay);
    return this;
  }

  initNewGameView = (cellsX, cellsY) => {
    this._view.grid.createGrid(cellsX, cellsY, constants.CELL_SIZE);
    this._view.playButton.enable();
    this._view.oneStepButton.enable();
    this._view.gameOverMessage.hide();
  }

  updateGridCell = (cellRow, cellCol) => {
    const gridCellIndex = (cellRow * this._model.cellsX) + cellCol;
    this._view.grid.updateCell(gridCellIndex);
  }

  updateMatrixCell = (cellIndex) => {
    const cellRow = Math.floor(cellIndex / this._model.cellsX);
    const cellCol = cellIndex % this._model.cellsX;
    this._model.updateCell(cellRow, cellCol);
  }

  toggleGameStatus = () => {
    if (!this._isGameRunning) {
      this.startGame();
    } else {
      this.stopGame();
    }
  }

  startGame = () => {
    if (this._view.delayInput.isValid()) {
      this._timerId = setInterval(this.updateMatrix.bind(this), this._delay);
      this._isGameRunning = true;
      this._view.playButton.setRunningStatus(this._isGameRunning);
    }
  }

  stopGame = () => {
    clearInterval(this._timerId);
    this._isGameRunning = false;
    this._view.playButton.setRunningStatus(this._isGameRunning);
  }

  endGame = () => {
    this.stopGame();
    this._view.gameOverMessage.show();
    this._view.playButton.disable();
    this._view.oneStepButton.disable();
  }

  updateMatrix = () => {
    this._model.calculateNextGeneration();
  }

  clearGrid = () => {
    this.stopGame();
    this._model.createGridMatrix(this._model.cellsX, this._model.cellsY);
  }

  changeMatrixWidth = (newCellsX) => {
    if (this._inputIsCorrect(newCellsX)) {
      this._view.widthInput.removeInvalidModificator();
      const cellsX = parseInt(newCellsX, 10);
      if (this._view.heightInput.isValid() && cellsX !== this._model.cellsX) {
        const cellsY = parseInt(this._view.heightInput.getValue(), 10);
        this.stopGame();
        this._model.createGridMatrix(cellsX, cellsY);
      }
    } else {
      this._view.widthInput.addInvalidModificator();
    }
  }

  changeMatrixHeight = (newCellsY) => {
    if (this._inputIsCorrect(newCellsY)) {
      this._view.heightInput.removeInvalidModificator();
      const cellsY = parseInt(newCellsY, 10);
      if (this._view.widthInput.isValid() && cellsY !== this._model.cellsY) {
        const cellsX = parseInt(this._view.widthInput.getValue(), 10);
        this.stopGame();
        this._model.createGridMatrix(cellsX, cellsY);
      }
    } else {
      this._view.heightInput.addInvalidModificator();
    }
  }

  changeDelay = (newDelay) => {
    if (this._inputIsCorrect(newDelay)) {
      this._view.delayInput.removeInvalidModificator();
      const delay = parseInt(newDelay, 10);
      if (delay !== this._delay) {
        this._delay = delay;
        if (this._isGameRunning) {
          clearInterval(this._timerId);
          this._timerId = setInterval(this.updateMatrix.bind(this), this._delay);
        }
      }
    } else {
      this._view.delayInput.addInvalidModificator();
    }
  }

  _inputIsCorrect = (stringValue) => {
    const parsedValue = parseFloat(stringValue, 10);
    return $.isNumeric(stringValue) && parsedValue > 0 && Number.isInteger(parsedValue);
  }
}

export default Controller;
