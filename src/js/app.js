App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // 如果Meta Mask已提供web3实例
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // 替换本地对应端口
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // 重新渲染
        App.render();
      });
    });
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // 使用build目录下生成的Election.json构造truffle合约
      App.contracts.Election = TruffleContract(election);
      // 设置provider与合约交互
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // 获取当前账户
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("当前账户: " + account);
      }
    });

    // 加载合约数据
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect1 = $('#candidatesSelect1');
      candidatesSelect1.empty();
      var candidatesSelect2 = $('#candidatesSelect2');
      candidatesSelect2.empty();
      var candidatesSelect3 = $('#candidatesSelect3');
      candidatesSelect3.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount0 = candidate[2];
          var voteCount1 = candidate[3];
          var voteCount2 = candidate[4];
          console.log(candidate);
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount0 + "</td><td>" + voteCount1 +"</td><td>" + voteCount2 +"</td></tr>"
          candidatesResults.append(candidateTemplate);

          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect1.append(candidateOption);
          candidatesSelect2.append(candidateOption);
          candidatesSelect3.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // 不允许已投票人投票
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },
 
  castVote: function() {
      var candidate1Id = $('#candidatesSelect1').val();
      var candidate2Id = $('#candidatesSelect2').val();
      var candidate3Id = $('#candidatesSelect3').val();
      var candidateIds = [candidate1Id, candidate2Id, candidate3Id];

      App.contracts.Election.deployed().then(function(instance) {
        return instance.vote(candidateIds, { from: App.account });
      }).then(function(result) {
        // 加载中
        $("#content").hide();
        $("#loader").show();
      }).catch(function(err) {
        console.error(err);
      });
    }  
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});