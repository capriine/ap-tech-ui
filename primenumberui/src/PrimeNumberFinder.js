import React from 'react';

class NumericInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: (props.value ? props.value : '' ),
            isValid: true,
            validationMessage: ""
        };

        this.handleChange = this.handleChange.bind(this);
    }

    render() {
        return (
            <div className="form-group">
                <label htmlFor={this.props.id}>{this.props.label}</label>
                <input 
                    type="text" 
                    className="form-control" 
                    id={this.props.id} 
                    placeholder={this.props.placeholder} 
                    value={this.state.value}
                    onChange={this.handleChange}
                    required
                />
                {! this.state.isValid &&
                    <div className="alert alert-secondary">
                        { this.state.validationMessage }
                    </div>
                }
            </div>
        );
    }

    handleChange(event)
    {
        let val = event.target.value;
        this.setState({value: val});

        let testVal = parseInt(val);

        if (Number.isNaN(testVal))
        {
            this.setState({
                isValid: false,
                validationMessage: "Please enter a whole number value",
            });
            return;
        }

        this.setState({
            isValid: true,
            validationMessage: "",
        });

        this.props.onChange(event.target.id, val);
    }

}

class InputForm extends React.Component {

    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        let initialVals = [];
        initialVals["maxValue"] = "";
        initialVals["pageNumber"] = "1";
        initialVals["numberPerPage"] = "5";

        this.state = {
            formValues: initialVals,
        }

    }

    render() {

        return (
            <form onSubmit={this.handleSubmit}>
                <NumericInput id={"maxValue"} label="Number to check" placeholder={"Enter the maximum to check"} onChange={this.handleInputChange} />
                <NumericInput id={"pageNumber"} label="Page number" placeholder={"What page number do you want?, e.g. 1"} value={1} onChange={this.handleInputChange} />
                <NumericInput id={"numberPerPage"} label="Number per page" placeholder={"How many do you want per page? e.g. 10"} value={5} onChange={this.handleInputChange} />
                <button className="btn btn-primary" type="submit">Find the Prime Numbers</button>
            </form>
        );
    }

    handleInputChange(controlId, value)
    {
        let vals = this.state.formValues;
        vals[controlId] = value;
        this.setState({formValues: vals});
    }

    handleSubmit(event)
    {
        this.props.onSubmit(this.state.formValues); 
        event.preventDefault();
    }

}

function ErrorDisplay(props) {
    if(!props.hasData)
    {
        return null;
    }
    return (
        <div className="alert alert-danger">
            <div className="h4">Error</div>
            {props.errorMessage}
        </div>
    );
}

function UnorderedList(props) {

    const outputNumbers = props.numbers;
    const listItems = outputNumbers.map((number) =>
        <li key={number}>{number}</li>
    );

    return (
        <ul>{listItems}</ul>
    );
}
  
function ResultDisplay(props) {

    if(!props.hasData)
    {
        return null;
    }

    return (
        <UnorderedList numbers={props.numbers} />
    );

}

class PrimeNumberFinder extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            numbers: null,
            status: null,
            error: null,
        }

        this.handleSubmit = this.handleSubmit.bind(this);

    }

    render() {

        return (
            <div className="App">

                <h1>Prime Numbers</h1>

                <p>
                    Welcome to the Prime Number finder! Enter a number to check, and you'll find all of the prime numbers up to, and including, the one you entered.
                </p>
                <p>
                    You can also page the data. Enter the page number and the number per page.
                </p>

                <h2>Input</h2>
                <InputForm 
                    onSubmit={this.handleSubmit}
                />
                <hr />

                <h2>Output</h2>
                <ErrorDisplay hasData={this.state.status === "Error"} errorMessage={this.state.error} />
                <ResultDisplay hasData={this.state.status === "Fetched"} numbers={this.state.numbers} />
                
            </div>
        );
    }

    callApi(inputValues) {

        this.setState({
            status:'Fetching',
            numbers: null,
            error: null
        });

        var url = process.env.REACT_APP_API_BASE_URL + inputValues["maxValue"] + '/' + inputValues["pageNumber"] + '/' + inputValues["numberPerPage"];

        const axios = require('axios');
        axios.get(url, {    
            headers: {
                'AuthToken': process.env.REACT_APP_API_AUTH_TOKEN,
            },
        })
        .then(function (response) {
            //console.log(response);
            if( response.data.isSuccess )
            {
                this.setState({
                    status:'Fetched',
                    numbers: response.data.numbers
                });
            }
            else
            {
                this.setState({
                    status:'Error',
                    error: response.data.errorMessage
                });
            }
            
        }.bind(this))
        .catch(function (error) {
            //console.log(error.message);
            this.setState({
                status:'Error',
                error: error.message
            });
        }.bind(this))
        .then(function () {
            
        });

    }

    handleSubmit(values)
    {
        //console.log(values);
        this.callApi(values);
    }

}

export default PrimeNumberFinder;