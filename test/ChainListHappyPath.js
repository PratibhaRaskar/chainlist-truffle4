var ChainList =artifacts.require("./ChainList.sol");

contract ('ChainList',function(accounts){
  var ChainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "article 1";
  var articleDescription1 = "Description for article 1";
  var articlePrice1 = 10 ;
  var articleName2 = "article 2";
  var articleDescription2 = "Description for article 2";
  var articlePrice2 = 20 ;
  var sellerBalanceBeforeBuy,sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy,buyerBalanceAfterBuy;

  it("should be initialized with empty values",function(){
    return ChainList.deployed().then(function(instance){
      ChainListInstance = instance;
      return ChainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data.toNumber(),0,"Number of articles must be zero");
      return ChainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length,0,"there shouldn't be any article for sale");
    });
  });

//sell a first article
it("should let us sell a first article",function(){
  return ChainList.deployed().then(function(instance){
    ChainListInstance = instance;
    return ChainListInstance.sellArticle(
      articleName1,
      articleDescription1,
      web3.toWei(articlePrice1,"ether"),
      {from:seller}
    );
  }).then(function(receipt){
     //check event
     assert.equal(receipt.logs.length,1,"one event should have been triggered");
     assert.equal(receipt.logs[0].event,"LogSellArticle"," event should be LogSellArticle");
     assert.equal(receipt.logs[0].args._id.toNumber(),1,"id must be 1");
     assert.equal(receipt.logs[0].args._seller,seller,"event seller must be" + seller);
     assert.equal(receipt.logs[0].args._name,articleName1,"event articleName must be" + articleName1);
     assert.equal(receipt.logs[0].args._price.toNumber(),web3.toWei(articlePrice1,"ether"),"event articlePrice must be" + web3.toWei(articlePrice1,"ether"));

     return ChainListInstance.getNumberOfArticles();
}).then(function (data) {
    assert.equal(data,1,"number of articles must be one");
    return ChainListInstance.getArticlesForSale();
  }).then(function(data){
    assert.equal(data.length,1,"there must be one article for sale");
    assert.equal(data[0].toNumber(),1,"article id must be 1");
    return ChainListInstance.articles(data[0]);
  }).then(function(data){
    assert.equal(data[0].toNumber(),1,"article id must be 1");
    assert.equal(data[1],seller,"seller must be " + seller);
    assert.equal(data[2],0x0,"buyer must be empty");
    assert.equal(data[3],articleName1,"article name must be " + articleName1);
    assert.equal(data[4],articleDescription1,"article description must be " + articleDescription1);
    assert.equal(data[5].toNumber(),web3.toWei(articlePrice1,"ether"),"article price must be " + web3.toWei(articlePrice1,"ether"));
  });
});

//sell a second article
it("should let us sell a second article",function(){
  return ChainList.deployed().then(function(instance){
    ChainListInstance = instance;
    return ChainListInstance.sellArticle(
      articleName2,
      articleDescription2,
      web3.toWei(articlePrice2,"ether"),
      {from:seller}
    );
  }).then(function(receipt){
     //check event
     assert.equal(receipt.logs.length,1,"one event should have been triggered");
     assert.equal(receipt.logs[0].event,"LogSellArticle"," event should be LogSellArticle");
     assert.equal(receipt.logs[0].args._id.toNumber(),2,"id must be 2");
     assert.equal(receipt.logs[0].args._seller,seller,"event seller must be" + seller);
     assert.equal(receipt.logs[0].args._name,articleName2,"event articleName must be" + articleName2);
     assert.equal(receipt.logs[0].args._price.toNumber(),web3.toWei(articlePrice2,"ether"),"event articlePrice must be" + web3.toWei(articlePrice2,"ether"));

     return ChainListInstance.getNumberOfArticles();
}).then(function (data) {
    assert.equal(data,2,"number of articles must be two");
    return ChainListInstance.getArticlesForSale();
  }).then(function(data){
    assert.equal(data.length,2,"there must be two articles for sale");
    assert.equal(data[1].toNumber(),2,"article id must be 2");
    return ChainListInstance.articles(data[1]);
  }).then(function(data){
    assert.equal(data[0].toNumber(),2,"article id must be 2");
    assert.equal(data[1],seller,"seller must be " + seller);
    assert.equal(data[2],0x0,"buyer must be empty");
    assert.equal(data[3],articleName2,"article name must be " + articleName2);
    assert.equal(data[4],articleDescription2,"article description must be " + articleDescription2);
    assert.equal(data[5].toNumber(),web3.toWei(articlePrice2,"ether"),"article price must be " + web3.toWei(articlePrice2,"ether"));
  });
});
//buy 1st article
  it("should buy an article",function(){
    return ChainList.deployed().then(function(instance){
      ChainListInstance = instance;
      //record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller),"ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer),"ether").toNumber();
       return ChainListInstance.buyArticle(1,{
         from: buyer,
         value: web3.toWei(articlePrice1,"ether")
       });
    }).then(function(receipt){
      assert.equal(receipt.logs.length,1,"one event should have been triggered");
      assert.equal(receipt.logs[0].event,"LogBuyArticle"," event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(),1,"article id must be 1" );
      assert.equal(receipt.logs[0].args._seller,seller,"event seller must be" + seller);
      assert.equal(receipt.logs[0].args._buyer,buyer,"event buyer must be" + buyer);
      assert.equal(receipt.logs[0].args._name,articleName1,"event articleName must be" + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(),web3.toWei(articlePrice1,"ether"),"event articlePrice must be" + web3.toWei(articlePrice1,"ether"));

//record the balances of buyer and seller after the buyer
        sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller),"ether").toNumber();
        buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer),"ether").toNumber();

        // check the effect of buy on balances of buyer and seller ,accounting for gas
        assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned" + articlePrice1 + "ETH");
        assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent" + articlePrice1 + "ETH");

        return ChainListInstance.getArticlesForSale();
        }).then(function(data){
          assert.equal(data.length,1,"there should now be only 1 article for sale");
          assert.equal(data[0].toNumber(), 2,"article 2 should  be the only one article left for sale " )
          return ChainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data.toNumber(),2,"there should still be 2 articles in total");
    });
  });

});
