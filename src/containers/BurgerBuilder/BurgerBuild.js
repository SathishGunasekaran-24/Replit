import React,{Component} from 'react';
import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger';
import Modal from '../../components/UI/Modal/Modal';
import BurgerControls from '../../components/Burger/BurgerControls/BurgerControls';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';

  const prices = {
    cheese:1,
    salad:2,
    meat:3,
    bacon:4
  }

class BurgerBuilder extends Component{
 
  state = {
    ingredients:null,
    totalprice:0,
    purchasable: false,
    purchasing:false,
    loading:false,
    error:false

  }
  componentDidMount(){
    axios.get('https://react-my-burger-8f919-default-rtdb.firebaseio.com/ingredients.json')
          .then(response=>{
            this.setState({ingredients: response.data});
          })
          .catch(error =>{
            this.setState({error:true});
          });
  }
  orderedItems = (ingredients) =>{
    const sum = Object.keys(ingredients).map(type => {return ingredients[type]}).reduce((sum,el)=>{
      return sum+el
    },0)
    this.setState(
      {
        purchasable:sum > 0
      }
    )
  }
  addIngredients = (type) => {
    const oldCount = this.state.ingredients[type];
    const updatedCount = oldCount+1;
    const updatedIncredients = {
    ...this.state.ingredients
    }
    updatedIncredients[type]=updatedCount;
    const oldPrice = this.state.totalprice;
    const updatedPrice = oldPrice+prices[type];
    this.setState(
      {
        ingredients:updatedIncredients,
        totalprice:updatedPrice
      }
    )
    this.orderedItems(updatedIncredients)
  }

changePurchasing = () => {
  this.setState(
    {
      puchasing:true
    }
  )
}

changeModel = () => {
  this.setState(
    {
      puchasing:false
    }
  )
}

placeOrder = () => {
  this.setState({loading:true})
  /*const order = {
    ingredients: this.state.ingredients,
    price: this.state.totalprice,
    customer:{
      name: 'Max',
      address:{
        street:'X',
        zipcode:'41351',
        country: 'Germany'
      },
      email: 'test@test.com'
    },
    deliverymethod: 'fastest'
  }

    axios.post('/orders.json',order)
        .then(response => {
          this.setState({loading:false,puchasing:false})
        })
        .catch(error=>{
          this.setState({loading:false,puchasing:false})
        });
    //alert("Thank you for Clicking Continue")*/
    const queryParams = [];
    for (let i in this.state.ingredients){
      queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]));
    }
    queryParams.push('price='+ this.state.totalprice);
    const queryString = queryParams.join('&')
    this.props.history.push({
    pathname:'/checkout',
    search:'?' + queryString});
}
  removeIngredients = (type) => {
    console.log(this.state.purchasable)
    const oldCount = this.state.ingredients[type];
    if(oldCount<=0){
      return
    }
    const updatedCount = oldCount-1;
    const updatedIncredients = {
    ...this.state.ingredients
    }
    updatedIncredients[type]=updatedCount;
    const oldPrice = this.state.totalprice;
    const updatedPrice = oldPrice-prices[type];
    this.setState(
      {
        ingredients:updatedIncredients,
        totalprice:updatedPrice
      }
    )
    this.orderedItems(updatedIncredients)
  }
  render(){
    const disabledInfo
     = {
      ...this.state.ingredients
    }

    for(let key in disabledInfo){
      disabledInfo[key]= disabledInfo[key]<=0
    }
    let burger = this.state.error ? <p>The ingredients cannot be loaded</p> : <Spinner />
    let orderSummary = null
    if(this.state.ingredients){
      burger = (
      <Aux>
      <Burger items={this.state.ingredients}/>
      <div><BurgerControls 
      removeIngredients={this.removeIngredients}
      addIngredients={this.addIngredients}
      disabled = {disabledInfo}
      price={this.state.totalprice}
      orderButton = {this.state.purchasable}
      purchasing={this.changePurchasing}
      /></div>
      </Aux>);
      orderSummary = (<OrderSummary ingredients={this.state.ingredients} 
                    purchaseCancelled={this.changeModel} 
                    purchaseOrdered={this.placeOrder}
                    price={this.state.totalprice}/>);
    }
                    
    if(this.state.loading){
      orderSummary= <Spinner />
    }

    return(
      <Aux>
      <Modal show={this.state.puchasing} clicked={this.changeModel}>
        {orderSummary}
      </Modal>
        {burger}
      </Aux>
    );
  }
}

export default withErrorHandler(BurgerBuilder,axios);