const fs = require('fs');

class Network{
    constructor(inputneurons, hiddenneurons, hiddenneurons2, outputneurons){
        this.input = inputneurons;
        this.hidden = hiddenneurons;
        this.hidden2 = hiddenneurons2;
        this.outneurons = outputneurons;
        this.weights = this.construction(this.input, this.hidden, this.hidden2, this.outneurons);
    }
    construction(inputneurons, hiddenneurons, hiddenneurons2, outputneurons) {
        let weights = [];
        let layers = [];
        if (hiddenneurons2 == 0) {
            layers = [inputneurons, hiddenneurons, outputneurons]
        }
        else{
            layers = [inputneurons, hiddenneurons, hiddenneurons2, outputneurons]
        }

        //aantal lagen vanaf hidden layer
        for (let i = 1; i < layers.length; i++) {
            let neurons = layers[i];
            weights[i-1] = [];
            //for aantal neurons die laag
            for (let j = 0; j < neurons; j++) {
                weights[i-1][j] = [];
                //for weights per neuron
                for (let k = 0; k < layers[i -1]; k++) {
                    weights[i-1][j][k] = Math.random();
                }
                //bias
                weights[i-1][j][weights[i-1][j].length] = Math.random();
            }
            
        }

        let data = JSON.stringify(weights, null, 1);
        fs.writeFile('weights.json', data, (err) => {
            if (err) {
                throw err;
            }
        });
        return weights;
    }
    forward(input, weights){
        //for elke layer vanaf hidden
        let output = [input]
        for (let i = 0; i < weights.length; i++) {
            //for elke neuron per layer
            output[i + 1] = []
            for (let j = 0; j < weights[i].length; j++) {
                output[i + 1][j] = outputNeuron(input, weights[i][j])
            }  
            input = output[i + 1]         
        }
        return output
        function outputNeuron(input, weights){
            let total = 0;;
            for (let i = 0; i < weights.length - 1; i++){
                total += weights[i] * input[i];;
            }
            total += weights[weights.length -1];
            total = sigmoid(total);
            return total;
        }
    }
    error(expected, output){
        let total = 0;
        for (let i = 0; i < output.length; i++) {
            total += 0.5 * (expected[i] - output[i])**2
        }
        return total;
    }
    train(input, expected, weights, learning_rate, iters){
        let output;
        for (let i = 0; i < iters; i++) {
            output = this.forward(input, weights)
            console.log(this.error(expected, output[output.length - 1]));
            weights = backpropagate(expected, output, weights, learning_rate) 
        }  
        let error = this.error(expected[0], output[output.length - 1])
        let data = JSON.stringify(weights, null, 1)
        fs.writeFile('new_weights.json', data, (err) => {
            if (err) {
                throw err;
            }
        });
        
        function backpropagate(expected, output, weights, learningrate) {
            var new_weights = []; 
            //layers
            for (let i = weights.length - 1; i > -1; i--) {
                new_weights[i] = []
                if (i != weights.length -1) {
                     //neurons in hidden layers
                     for (let j = 0; j < weights[i].length; j++) {
                        new_weights[i][j] = []
                        let total = 0;
                        for (let l = 0; l < weights[i + 1].length; l++) {
                            total += new_weights[i + 1][l][j] * weights[i+1][l][j]
                        }
                        for (let k = 0; k < weights[i][j].length; k++) {
                           new_weights[i][j][k] = slope_sigmoid(output[i+1][j]) * total;
                        }
                    }
                }
                else{
                    //neurons in output
                    for (let j = 0; j < weights[i].length; j++) {
                        new_weights[i][j] = []
                        for (let k = 0; k < weights[i][j].length; k++) {
                           new_weights[i][j][k] = -(expected[j] - output[i+1][j]) * slope_sigmoid(output[i+1][j]);
                        }
                    }
                }
                
            }
            //multiple the input of neuron  
            //doesn't work
            for (let m = 0; m < weights.length; m++) {              
                for (let n = 0; n < weights[m].length; n++) {
                    for (let p = 0; p < weights[m][n].length - 1; p++) {
                        new_weights[m][n][p] *= output[m][p]
                    }
                }
            }
            //update the old weights
            for (let m = 0; m < weights.length; m++) {
                for (let n = 0; n < weights[m].length; n++) {
                    for (let p = 0; p < weights[m][n].length; p++) {
                        weights[m][n][p] = weights[m][n][p] - new_weights[m][n][p] * learning_rate
                    }
                }
                
            };
            return weights;
        
        }
        return weights;
    }
}
function sigmoid(z) {  
    return 1 / (1 + Math.exp(-z));
} 
function slope_sigmoid(z) {
    return z * (1-z)
}

const x = [0.2333, 0.4656, 0.76769, 0.87975]
const y = [0.2344, 0.999]
network = new Network(4, 3, 0, 2);
let trained = network.train(x, y, network.weights, 0.1, 1000)
console.log(trained);
console.log(forward(x, trained))


function forward(input, weights){
    //for elke layer vanaf hidden
    for (let i = 0; i < weights.length; i++) {
        //for elke neuron per layer
        let output = []
        for (let j = 0; j < weights[i].length; j++) {
            output[j] = outputNeuron(input, weights[i][j])
        }  
        input = output         
    }
    return input
    function outputNeuron(input, weights){
        let total = 0;;
        for (let i = 0; i < weights.length - 1; i++){
            total += weights[i] * input[i];;
        }
        total += weights[weights.length -1];
        total = sigmoid(total);
        return total;
    }
}