pragma solidity ^0.4.18;

import "./Ownable.sol";

contract ChainList is Ownable{
  //CUSTOM TYPES
  struct Article{
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }
  // state variables

  mapping (uint => Article) public articles;
  uint articleCounter;

  // events
  event LogSellArticle(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
  );
  event LogBuyArticle(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
  );


  function kill() public onlyOwner {
      selfdestruct(owner);
  }

  // sell an article
  function sellArticle(string _name, string _description, uint256 _price) public {
    articleCounter++;

    // store this article
    articles[articleCounter]= Article(
      articleCounter,
      msg.sender,
      0x0,
      _name,
      _description,
      _price
      );

    LogSellArticle(articleCounter, msg.sender, _name, _price);
  }

  //FETCH NO OF ARTICLES IN CONTRACT
  function getNumberOfArticles() public view returns (uint) {
    return articleCounter;
  }

  // fetch and return all articles IDs for articles still for sale
  function getArticlesForSale()  public view returns(uint[]){
    uint[] memory ArticlesIds = new uint[](articleCounter);
    //prepare output array
    uint numberOfArticlesForSale = 0;
    //iterate over ARTICLES
    for (uint i= 1; i<= articleCounter; i++) {
      // keep the ID IF THE ARTICLE IS STILL FOR SALE
      if(articles[i].buyer == 0x0){
        ArticlesIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }
    //copy the ArticlesIds array into a smaller forsale array
    uint[] memory forsale = new uint[](numberOfArticlesForSale);
    for(uint j = 0; j < numberOfArticlesForSale; j++){
      forsale[j] = ArticlesIds[j];
    }
    return forsale;
  }
  // buy an article
  function buyArticle(uint _id) payable public {
    // we check whether there is an article for sale
    require(articleCounter > 0);

    // we check that the article exists
    require(_id > 0 && _id <= articleCounter);

    // we retrieve the article
    Article storage article = articles[_id];

    // we check that the article has not been sold yet
    require(article.buyer == 0X0);

    // we don't allow the seller to buy his own article
    require(msg.sender != article.seller);

    // we check that the value sent corresponds to the price of the article
    require(msg.value == article.price);

    // keep buyer's information
    article.buyer = msg.sender;

    // the buyer can pay the seller
    article.seller.transfer(msg.value);

    // trigger the event
    LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
  }
}
