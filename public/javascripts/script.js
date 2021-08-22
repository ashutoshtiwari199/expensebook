const create_expense = document.querySelector(".create_expense")



const create_expense_form = document.querySelector(".create_expense_form")
const create_expense_form_submit = document.querySelector(".add_sign")
const create_expense_form_input = document.querySelector(".create_expense_form_input")



create_expense.addEventListener("click", function(){
    create_expense.classList.add('hide');
    create_expense_form.classList.remove('hide');
    create_expense_form_input.classList.remove('hide');
    create_expense_form_submit.classList.remove('hide');
})

create_expense_form_submit.addEventListener("click", function(){
    create_expense.classList.remove('hide');
    // create_expense_form.classList.remove('hide');
    create_expense_form.classList.add('hide');
    create_expense_form_input.classList.add('hide');
    create_expense_form_submit.classList.add('hide');
})




  