const View = require("../view/view");
const Model = require("../model/model");
const Controller = require("../controller/controller");

class App {

    init() {        
        let model = new Model();
        let view = new View(model);
        let controller = new Controller(model, view);        
        view.observeModel();
        model.createGridMatrix(50, 50);
        controller.setGridListeners();
    }
}

const app = new App();
app.init();

module.exports = App;