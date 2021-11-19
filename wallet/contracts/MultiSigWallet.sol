// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0 < 0.9.0;

///@title IReceiver
///@notice Interface to interact with the Receiver contract, 
///this contract has a "track" of the safes created with their creators.
interface IReceiver {
    function updateTracking(address _owner, address _newSafe) external;
    function returnTracking(address _owner) external view returns (address[] memory);
}

///@title MultiSigWallet
///@notice simple MultiSig wallet for ethereum
///@author Rodrigo Herrera Itie
contract MultiSigWallet {
    // address of Receiver.sol on rinkeby
    IReceiver iReceiver;
    ///quorum for minimum approval for transactions
    ///@return the current quorum.
    // example: if we have a quorum of 3, we would need
    // the authorization from 3 owners at least to execute
    // any transaction.
    uint public quorum;

    // counter to keep track of total requested transaction.
    // "transaction" without any additional words, is only for transactions that send eth.
    uint private transactionIndex;

    // counter to keep track of total transactions to update the quorum.
    uint private updateQuorumIndex;

    // counter to keep track of total transactions to remove an owner.
    uint private removeOwnerIndex;

    // counter to keep track of total transactions to add an owner.
    uint private addOwnerIndex;

    // array that contains the addresses of the owners,
    // only an owner can sign to approve transactions.
    // 1 signature from an owner == 1 quorum
    address[] public owners;

    // check if an address is an owner, this is only used
    // for the deployment (constructor).
    mapping(address => bool) isOwner;

    // checks if an owner already signed a Transaction.
    mapping(address => mapping(uint => bool)) transactionSigners;

    // checks if an owner already signed an UpdateQuorum transaction.
    mapping(address => mapping(uint => bool)) updateQuorumSigners;

    // checks if an owner already signed a RemoveOwner transaction.
    mapping(address => mapping(uint => bool)) removeOwnerSigners;

    // checks if an owner already signed an AddOwner transaction.
    mapping(address => mapping(uint => bool)) addOwnerSigners;

    // emits an event every time a transaction is sent.
    event NewTransaction(address _to, uint _value, address _sender, string _message);

    // emits an event every time this contract receives a new payment.
    event NewDeposit(address _sender, uint _value, string _message);

    // emits an event every time the quorum gets updated.
    event NewQuorum(uint _oldQuorum, uint _newQuorum, address _sender, string _message);

    // emits an event every time an owner gets removed.
    event OwnerRemoved(address _removed, address _sender, string _message);

    // emits an event every time an owner gets add.
    event OwnerAdded(address _new, address _sender, string _message);

    // struct for a Transaction (sending eth to another account).
    ///@param _to = the receiver of the transaction.
    ///@param _value = amount to send in wei.
    ///@param _index = current # of this transaction in chronological order.
    ///@param _signatures = number of owners that signed this transaction.
    ///@param _approved = if true, the transaction was already sent.
    struct Transaction {
        address _to;
        uint _value;
        uint _index;
        uint _signatures;
        bool _approved;
    }

    // struct for an UpdateQuorum transaction.
    ///@param _quorum = request for a new quorum (needs to be more than 0 and less than n of owners).
    ///@param _index = current # of this transaction in chronological order.
    ///@param _signatures = number of owners that signed this transaction.
    ///@param _approved = if true, the transaction was already sent.
    struct UpdateQuorum {
        uint _quorum;
        uint _index;
        uint _signatures;
        bool _approved;
    }

    // struct for a RemoveOwner transaction.
    ///@param _remove = the address to remove (needs to be a current owner).
    ///@param _index = current # of this transaction in chronological order.
    ///@param _signatures = number of owners that signed this transaction.
    ///@param _approved = if true, the transaction was already sent.
    struct RemoveOwner {
        address _remove;
        uint _index;
        uint _signatures;
        bool _approved;
    }

    // struct for an AddOwner transaction.
    ///@param _add = the address to add (it cannot be a current owner).
    ///@param _index = current # of this transaction in chronological order.
    ///@param _signatures = number of owners that signed this transaction.
    ///@param _approved = if true, the transaction was already sent.
    struct AddOwner {
        address _add;
        uint _index;
        uint _signatures;
        bool _approved;
    }

    // array of a Transaction struct.
    Transaction[] transactions;

     // array of an UpdateQuorum struct.
    UpdateQuorum[] updateQuorum;

     // array of a RemoveOwner struct.
    RemoveOwner[] removeOwner;

     // array of an AddOwner struct.
    AddOwner[] addOwner;

    ///@notice when deploying the contract, the owners and quorum must be provided.
    // There needs to be more than 0 owners (at least 1) and the quorum needs to be
    // less than the total number of owners.
    ///@param _owners = address of owners.
    ///@param _quorum = minimum uint to approve transactions
    constructor(address[] memory _owners, uint _quorum) {
        require(_owners.length > 0, "There needs to be more than 0 owners");
        require(_quorum <= _owners.length, "Quorum exceeds owners");
        require(_quorum > 0, "Quorum needs to be more than 0");
        iReceiver = IReceiver(0xf8b7C0728E590800919511C58B1c7574644092ac);
        for (uint i=0; i< _owners.length; i++) {
            address owner = _owners[i];
            require(!isOwner[owner], "Address already an owner");
            require(owner != address(this), "This address can't be owner");
            require(owner != address(0), "Address 0 can't be owner");
            // updates tracking of the Receiver contract
            iReceiver.updateTracking(owner, address(this));
            owners.push(owner);
            isOwner[owner] = true;
        }
        quorum = _quorum;
    }

    receive() external payable {
        emit NewDeposit(msg.sender, msg.value, "New deposit emitted");
    }

    // checks if the caller is an owner.
     modifier onlyOwners() {
        bool confirmation;
        for (uint i=0; i<owners.length; i++) {
            if (owners[i] == msg.sender) {
                confirmation = true;
            }
        }
        require(confirmation, "You are not an owner");
        _;
    }

    // request to send a transaction, only an owner can call this function.
    // this transaction is specifically to send eth. 
    ///@param to = receiver address.
    ///@param value = amount in wei to send.
    function transactionRequest(address to, uint value) external onlyOwners {
        require(address(this).balance >= value, "Not enough funds");
        require(to != address(0), "Zero address not supported");
        transactions.push(
            Transaction({
                _to:to,
                _value:value,
                _index:transactionIndex,
                _signatures:0,
                _approved:false

            })
        );
        transactionIndex += 1;
    }

    // approval of a given transaction. In order to approve the transaction,
    // the quorum uint needs to be reached by owner's signatures.
    ///@param _index = the index of the transaction to approve.
    function transactionApproval(uint _index) external onlyOwners {
        require(transactions[_index]._value >= 0, "Transaction does not exists");
        require(transactionSigners[msg.sender][_index] == false, "You already signed this transaction");
        Transaction storage t = transactions[_index];
        require(!t._approved, "Transaction already approved");
        t._signatures += 1;
        transactionSigners[msg.sender][_index] = true;
        if (t._signatures >= quorum) {
            (bool sent, ) = t._to.call{value:t._value}("");
            require(sent, "Transaction failed");
            t._approved = true;
            emit NewTransaction(t._to, t._value, msg.sender, "New transaction sent");
        }
    }

    // request to update the quorum, only an owner can call this function.
    ///@param _newQuorum = request for new quorum,
    ///(it needs to be less than or equal to the number of owners).
    function updateQuorumRequest(uint _newQuorum) external onlyOwners {
        require(_newQuorum <= totalOwners(), "Quorum exceeds total owners");
        require(_newQuorum > 0, "You need at least quorum of 1");
        updateQuorum.push(
            UpdateQuorum({
                _quorum:_newQuorum,
                _index:updateQuorumIndex,
                _signatures:0,
                _approved:false
            })
        );
        updateQuorumIndex += 1;
    }

    // approval to update the quorum. 
    ///@param _index = the index of the transaction to approve.
    function updateQuorumApproval(uint _index) external onlyOwners {
        require(updateQuorum[_index]._quorum >= 0, "Transaction does not exists");
        require(updateQuorumSigners[msg.sender][_index] == false, "You already signed this transaction");
        UpdateQuorum storage uq = updateQuorum[_index];
        require(!uq._approved, "Transaction already approved");
        uq._signatures += 1;
        updateQuorumSigners[msg.sender][_index] = true;
        if (uq._signatures >= quorum) {
            emit NewQuorum(quorum,uq._quorum, msg.sender, "Quorum got updated");
            quorum = uq._quorum;
            uq._approved = true;
        }
    }

    // request to remove an owner, there needs to be at least 1 owner.
    ///the quorum needs to be less than or equal to the number of owners.
    ///@param _remove = the address to remove (it needs to be a current owner).
    function removeOwnerRequest(address _remove) external onlyOwners {
        bool approval;
        require((totalOwners() - 1) > 0, "There needs to be at least 1 owner");
        require((totalOwners() -1) >= quorum, "There needs to be more owners than quorum");
        for (uint i=0; i<owners.length; i++) {
            if (owners[i] == _remove) {
                approval = true;
            }
        }
        require(approval, "Address to remove is not an owner");
        removeOwner.push(
            RemoveOwner({
                _remove:_remove,
                _index: removeOwnerIndex,
                _signatures:0,
                _approved:false
            })
        );
        removeOwnerIndex += 1;
    }

    // approval to remove an owner, it needs to reach the minimum quorum (signatures of owners).
    ///@param _index = the index of the transaction to approve.
    function removeOwnerApproval(uint _index) external onlyOwners {
        require(removeOwnerSigners[msg.sender][_index] == false, "You already signed this transaction");
        RemoveOwner storage rmvOwner = removeOwner[_index];
        require(!rmvOwner._approved, "Transaction already approved");
        address toRemove = rmvOwner._remove;
        rmvOwner._signatures += 1;
        removeOwnerSigners[msg.sender][_index] = true;
        if (rmvOwner._signatures >= quorum) {
            uint index;
            for (uint i=0; i<owners.length; i++) {
                if (owners[i] == toRemove) {
                    index = i;
                }
            }
            delete owners[index];
            emit OwnerRemoved(toRemove, msg.sender, "Owner removed");
            rmvOwner._approved = true;
        }
    }

    // request to add an owner.
    ///@param _newOwner = the address of the requested new owner (it cannot be a current owner).
    function addOwnerRequest(address _newOwner) external onlyOwners {
        bool _isOwner;
        for (uint i=0; i<owners.length; i++) {
            if (_newOwner == owners[i]) {
                _isOwner = true;
            }
        }
        require(_isOwner == false, "Address is already an owner");
        require(_newOwner != address(this), "This address cannot be owner");
        require(_newOwner != address(0), "Address 0 cannot be owner");
        addOwner.push(
            AddOwner({
                _add:_newOwner,
                _index:addOwnerIndex,
                _signatures:0,
                _approved:false
            })
        );
        addOwnerIndex += 1;
    }

    // approval to add an owner.
    ///@param _index = the index of the transaction to approve.
    function addOwnerApproval(uint _index) external onlyOwners {
        require(addOwnerSigners[msg.sender][_index] == false, "You already signed this transaction");
        AddOwner storage _addOwner = addOwner[_index];
        address toAdd = _addOwner._add;
        require(!_addOwner._approved, "Transaction already approved");
        _addOwner._signatures += 1;
        addOwnerSigners[msg.sender][_index] = true;
        if (_addOwner._signatures >= quorum) {
            owners.push(toAdd);
            emit OwnerAdded(toAdd, msg.sender, "New owner added");
            _addOwner._approved = true;
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    ///              ------------>    UTIL FUNCTIONS   <--------------

    // returns the indexes of pending transactions. 
    ///this is only for regular transactions (sending ether).
    ///@return = returns an array of the indexes of the pending transactions.
    function pendingTransactionsIndex()
            private
            view
            returns (uint[] memory)
    {
        uint counter;
        for (uint i=0; i<transactions.length; i++) {
            if (transactions[i]._approved == false) {
                counter += 1;
            }
        }
        uint[] memory result = new uint[](counter);
        uint index;
        for (uint i=0; i<transactions.length; i++) {
            if (transactions[i]._approved == false) {
                result[index] = i;
                index += 1;
            }
        }
        return result;
    }

    // returns the whole transaction data (the struct).
    ///@return = an array of pending transactions in struct format.
    function pendingTransactionsData()
                external
                view 
                onlyOwners
                returns (Transaction[] memory)
    {
        uint[] memory pendingTr = pendingTransactionsIndex();
        Transaction[] memory t = new Transaction[](pendingTr.length);
        for (uint i=0; i<pendingTr.length; i++) {
            t[i] = transactions[pendingTr[i]];
        }
        return t;
    }

    // returns the indexes of pending update quorum transactions. 
    ///@return = returns an array of the indexes of the pending update quorum transactions.
    function pendingUpdateQuorumIndex()
            private
            view
            returns (uint[] memory)
    {
        uint counter;
        for (uint i=0; i<updateQuorum.length; i++) {
            if (updateQuorum[i]._approved == false) {
                counter += 1;
            }
        }
        uint[] memory result = new uint[](counter);
        uint index;
        for (uint i=0; i<updateQuorum.length; i++) {
            if (updateQuorum[i]._approved == false) {
                result[index] = i;
                index += 1;
            }
        }
        return result;
    }

    // returns the whole transaction data (the struct).
    ///@return = an array of pending update quorum transactions in struct format.
    function pendingUpdateQuorumData()
                external
                view 
                onlyOwners
                returns (UpdateQuorum[] memory)
    {
        uint[] memory pendingUQ = pendingUpdateQuorumIndex();
        UpdateQuorum[] memory uq = new UpdateQuorum[](pendingUQ.length);
        for (uint i=0; i<pendingUQ.length; i++) {
            uq[i] = updateQuorum[pendingUQ[i]];
        }
        return uq;
    }

    // returns the indexes of pending remove owner transactions. 
    ///@return = returns an array of the indexes of the pending remove owner transactions.
    function pendingRemoveOwnerIndex()
            private
            view
            returns (uint[] memory)
    {
        uint counter;
        for (uint i=0; i<removeOwner.length; i++) {
            if (removeOwner[i]._approved == false) {
                counter += 1;
            }
        }
        uint[] memory result = new uint[](counter);
        uint index;
        for (uint i=0; i<removeOwner.length; i++) {
            if (removeOwner[i]._approved == false) {
                result[index] = i;
                index += 1;
            }
        }
        return result;
    }

    // returns the whole transaction data (the struct).
    ///@return = an array of pending remove owner transactions in struct format.
    function pendingRemoveOwnerData()
                external
                view 
                onlyOwners
                returns (RemoveOwner[] memory)
    {
        uint[] memory pendingRO = pendingRemoveOwnerIndex();
        RemoveOwner[] memory ro = new RemoveOwner[](pendingRO.length);
        for (uint i=0; i<pendingRO.length; i++) {
            ro[i] = removeOwner[pendingRO[i]];
        }
        return ro;
    }

    // returns the indexes of pending add owner transactions. 
    ///@return = returns an array of the indexes of the pending add owner transactions.
    function pendingAddOwnerIndex()
            private
            view
            returns (uint[] memory)
    {
        uint counter;
        for (uint i=0; i<addOwner.length; i++) {
            if (addOwner[i]._approved == false) {
                counter += 1;
            }
        }
        uint[] memory result = new uint[](counter);
        uint index;
        for (uint i=0; i<addOwner.length; i++) {
            if (addOwner[i]._approved == false) {
                result[index] = i;
                index += 1;
            }
        }
        return result;
    }

    // returns the whole transaction data (the struct).
    ///@return = an array of pending add owner transactions in struct format.
    function pendingAddOwnerData()
                external
                view 
                onlyOwners
                returns (AddOwner[] memory)
    {
        uint[] memory pendingAO = pendingAddOwnerIndex();
        AddOwner[] memory ao = new AddOwner[](pendingAO.length);
        for (uint i=0; i<pendingAO.length; i++) {
            ao[i] = addOwner[pendingAO[i]];
        }
        return ao;
    }

     // returns the total number of owners of this contract in uint.
     // once deleted with "delete" keywork, the address remains as 0x000...
     // that is why we do not contemplate address(0).
     ///@return = uint of total active owners.
    function totalOwners() 
            public 
            view 
            returns (uint) 
        {
        uint result;
        for (uint i=0; i<owners.length; i++) {
            if (owners[i] != address(0)) {
                result += 1;
            }
        }
        return result;
    }

    ///@return = returns an array of the addresses of the active owners, 
    ///excluding address(0).
    function getOwnersAddress() 
            external
            view
            returns (address[] memory) 
    {
        require(owners.length > 0, "0 owners not valid, ERROR!");
        uint counter;
        for (uint i=0; i<owners.length; i++) {
            if (owners[i] != address(0)) {
                counter += 1;
            }
        }
        address[] memory result = new address[](counter);
        uint index;
        for (uint i=0; i<owners.length; i++) {
            if (owners[i] != address(0)) {
                result[index] = owners[i];
                index+= 1;
            }
        }
        return result;
    }   
}































