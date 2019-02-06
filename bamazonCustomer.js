var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

var inquirer = require("inquirer");
connection.connect(function (err) {
  if (err) throw err;
  // console.log("connected as id " + connection.threadId);
});

// Create a "Prompt" with a series of questions.
inquirer
  .prompt([
    {
      type: "input",
      message: "what is the ID of the product you would like to buy",
      name: "choice"
    },
    {
      type: "input",
      message: "How many would you like to buy?",
      name: "choiceAmount"
    }
  ])

  .then(response => {

    let selection = response.choice[0];

    let numberOf = response.choiceAmount;



    connection.query(`SELECT stock_quantity FROM products WHERE id =${selection}`, function (err, res) {

      if (err) throw err;
      stockAmount = (JSON.parse(JSON.stringify(res[0])));
      stockAmount = stockAmount.stock_quantity;

      // console.log("number of", numberOf);
      if (numberOf > stockAmount) {
        console.log(" \n")
        console.log(`we currently only have ${stockAmount} units in stock for that item right now... `)
        console.log("Please retry order.")
        process.exit(22);
      }
      else {
        console.log("finding items...\n");
        console.log(`You have selected item #: ${selection} \n`)

        connection.query(`SELECT * FROM products WHERE id = ${selection}`, function (err, res) {

          if (err) throw err;

          let itemDescription = (JSON.parse(JSON.stringify(res[0])));
          console.log("ITEM DESCRIPTION: \n------------------------------------\n", itemDescription)
          console.log("\n")
          inquirer
            .prompt([
              {
                type: "confirm",
                message: `Are you sure you would like to puchase ${numberOf} ${itemDescription.product_name}?`,
                name: "confirm",
                default: true
              }
            ])

            .then(function (inquirerResponse) {
              if (inquirerResponse.confirm) {
                console.log(" \n Thank you for your purchase")
                let totalPrice = (numberOf * itemDescription.price)
                console.log(`You have been charged $${totalPrice}`)
                let updatedStock = stockAmount - numberOf
                console.log("now in stock:", updatedStock);
                connection.query(`UPDATE products SET stock_quantity = ${updatedStock} WHERE id = ${selection}`)
                process.exit(22);
              }
              
              else {
                console.log(" \n Thank you for waisting my time at Bamazon!")
                process.exit(22);
              }
            });

        });
      }
    })



  });
