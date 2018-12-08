pragma solidity ^0.4.24;

contract Election {
    // 候选人model
	struct Candidate {
        uint id;
        string name;
        // uint[] voteCount;
        uint voteCount0;
        uint voteCount1;
        uint voteCount2;
    }

    // 候选人getter
    mapping(uint => Candidate) public candidates;
    // 已投票投票人
    mapping(address => bool) public voters;
    // 候选人人数
    uint public candidatesCount;

    event votedEvent (
        uint[] indexed _candidateId
    );

 	function Election () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        addCandidate("Candidate 3");
        addCandidate("Candidate 4");
        addCandidate("Candidate 5");
    }

    function addCandidate (string _name) private {
        candidatesCount ++; // 新候选人ID
        // uint[] storage _voteCount;
        // for (uint i = 0; i < m; i++) {
        //     _voteCount.push(uint(0));
        // }
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0, 0, 0);
    }

    function vote (uint[] _candidateIds) public {
        // 检查投票人资格
        require(!voters[msg.sender]);
        // 记录投票人已投过票
        voters[msg.sender] = true;
        // Borda票数统计
        // for(uint i = 0; i < _candidateIds.length; i++) {
        //     candidates[_candidateIds[i]].voteCount[i]++;
        // }
        candidates[_candidateIds[0]].voteCount0++;
        candidates[_candidateIds[1]].voteCount1++;
        candidates[_candidateIds[2]].voteCount2++;
        // 触发投票事件
        votedEvent(_candidateIds);
    }
}