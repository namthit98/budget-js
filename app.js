const budgetController = (() => {
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(incTotal) {
    if (incTotal > 0) {
      this.percentage = Math.round((this.value / incTotal) * 100);
    } else {
      this.percentage = -1
    }
  };

  const Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = type => {
    data.totals[type] = data.allItems[type].reduce((result, current) => {
      return (result += current.value);
    }, 0);
  };

  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    calculateBudget: () => {
      calculateTotal("inc");
      calculateTotal("exp");

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

      data.allItems.exp.forEach(element =>
        element.calculatePercentage(data.totals.inc)
      );
    },
    getBudget: () => ({
      inc: data.totals.inc,
      exp: data.totals.exp,
      budget: data.budget,
      percentage: data.percentage
    }),
    getExpsPercentage: () => {
      return data.allItems.exp.map(item => item.percentage)
    },
    deleteItem: (type, ID) => {
      data.allItems[type] = data.allItems[type].filter(item => item.id !== ID);
    },
    addItems: (type, desc, value) => {
      let newItem, ID;

      const itemsNum = data.allItems[type].length;

      if (itemsNum > 0)
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      else ID = 0;

      if (type === "inc") {
        newItem = new Income(ID, desc, value);
      } else if (type === "exp") {
        newItem = new Expense(ID, desc, value);
      }

      data.allItems[type].push(newItem);

      return newItem;
    },
    getData: () => data
  };
})();

const UIController = (() => {
  const DOMString = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    addBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetValue: ".budget__value",
    incomeValue: ".budget__income--value",
    expenseValue: ".budget__expenses--value",
    percentageValue: ".budget__expenses--percentage",
    container: ".container",
    date: ".budget__title--month",
    changeTypeSelect: ".add__type"
  };

  return {
    getDOMStrings: () => DOMString,
    getInput: () => ({
      type: document.querySelector(DOMString.inputType).value,
      description: document.querySelector(DOMString.inputDescription).value,
      value: parseFloat(document.querySelector(DOMString.inputValue).value)
    }),
    addListItems: (obj, type) => {
      let html;
      const element =
        type === "inc"
          ? DOMString.incomeContainer
          : DOMString.expensesContainer;

      if (type === "inc") {
        html = `
            <div class="item clearfix" id="inc-${obj.id}">
                <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                    <div class="item__value">+ ${obj.value}</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>
        `;
      } else {
        html = `
            <div class="item clearfix" id="exp-${obj.id}">
                <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                    <div class="item__value">- ${obj.value}</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>
        `;
      }

      document.querySelector(element).insertAdjacentHTML("afterbegin", html);
    },
    clearFields: () => {
      const fields = document.querySelectorAll(
        DOMString.inputDescription + "," + DOMString.inputValue
      );

      fields.forEach(field => {
        field.value = "";
      });
      fields[0].focus();
    },
    displayBudget: budget => {
      document.querySelector(DOMString.budgetValue).textContent = budget.budget;
      document.querySelector(DOMString.incomeValue).textContent = budget.inc;
      document.querySelector(DOMString.expenseValue).textContent = budget.exp;
      document.querySelector(DOMString.percentageValue).textContent =
        budget.percentage + "%";

      if (budget.percentage < 0) {
        document.querySelector(DOMString.percentageValue).textContent = "----";
      }
    },
    displayExpPercentage: (exps) => {
      document.querySelectorAll('.item__percentage').forEach((element, index) => {
        element.textContent = exps[index] > 0 ? exps[index] + '%' : '---'
      })
    },
    deleteListItem: (type, ID) => {
      const id = `${type}-${ID}`;
      const el = document.getElementById(id);

      if (el) {
        el.parentNode.removeChild(el);
      }
    },
    displayDate: () => {
      const now = new Date();
      document.querySelector(DOMString.date).textContent = `${now.getMonth() +
        1} ${now.getFullYear()}`;
    },
    toggleStyles: () => {
      const fields = document.querySelectorAll(
        DOMString.inputDescription +
          "," +
          DOMString.inputValue +
          "," +
          DOMString.changeTypeSelect
      );

      fields.forEach(field => {
        field.classList.toggle("red-focus");
      });

      document.querySelector(DOMString.addBtn).classList.toggle("red");
    }
  };
})();

const controller = ((budgetCtrl, UICtrl) => {
  const DOM = UICtrl.getDOMStrings();

  const setupEventListener = () => {
    document.querySelector(DOM.addBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", event => {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.changeTypeSelect)
      .addEventListener("change", toggleStyles);
  };

  const toggleStyles = () => {
    UICtrl.toggleStyles();
  };

  const updateBudget = () => {
    budgetCtrl.calculateBudget();

    const budget = budgetCtrl.getBudget();
    const exps = budgetCtrl.getExpsPercentage()

    UICtrl.displayBudget(budget);
    UICtrl.displayExpPercentage(exps.reverse())
  };

  const ctrlDeleteItem = event => {
    const element = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (element) {
      const [type, ID] = element.split("-");
      // xoa trong data
      budgetCtrl.deleteItem(type, parseInt(ID));
      // xoas list
      UICtrl.deleteListItem(type, ID);
      // update
      updateBudget();
    }
  };

  const ctrlAddItem = () => {
    let newItem;
    const { type, description, value } = UICtrl.getInput();
    if (description !== "" && !isNaN(value) && value > 0) {
      newItem = budgetCtrl.addItems(type, description, value);

      UICtrl.addListItems(newItem, type);
      UICtrl.clearFields();
      updateBudget();
    }
  };

  return {
    init: () => {
      console.log("App is running ....");
      UICtrl.displayBudget({
        inc: 0,
        exp: 0,
        budget: 0,
        percentage: -1
      });
      UICtrl.displayDate();
      setupEventListener();
    }
  };
})(budgetController, UIController);

controller.init();
