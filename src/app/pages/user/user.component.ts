import { Component, OnInit } from "@angular/core";

import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "angular-2-local-storage";
import {
  AngularFireDatabase,
  FirebaseListObservable
} from "angularfire2/database";
import { Select2OptionData } from "ng2-select2";
import { CropperSettings } from "ng2-img-cropper";

import { ComumService } from "../../services/comum.service";
import { DataService } from "./../../services/data.service";
import { Account } from "../../models/account.model"
import { Employee } from "../../models/employee.model"

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html"
})
export class UserComponent implements OnInit {
  public columns: Array<any> = [
    {
      title: "Name",
      name: "display_name",
      sort: 'asc',
      filtering: { filterString: "", placeholder: "Filtrar por nome" }
    },
    {
      title: "Email",
      name: "email",
      sort: false,
      filtering: { filterString: "", placeholder: "Filtrar por email" },
      className: ['hidden-xs']
    },
  ];

  private data: Array<any> = [];
  private dataOp: Array<any> = [];

  public accountTypeList: Array<Select2OptionData>; // tipos de usuario
  public storeList: Array<Select2OptionData>; // lista de lojas (sujeita a mudanças)
  public storeListTemp: Array<Select2OptionData>; // lista de todas as lojas (não muda, só é abastecida e utilizada)

  private EditData: Account = new Account(); // guarda dados do usuario
  private sendData: Account = new Account(); // guarda todos os hashs e informações necessárias e é enviado ao banco

  private path: any;
  private modalReference: any;
  private account_type_id: any; // tipo de usuario
  private tableUserList: any = []; // tabela inferior na aba tipo de usuario, usada para inserção e edição de usuários múltiplos
  private accValues: any = []; // lista de contratantes
  private accVal: any; // id do contratante selecionado
  private tempStore: any = []; // array com lojas selecionadas
  private pinArray = []; //pincode

  private isContractNeeded: boolean = false; // mostra/esconde combo de contratante
  private isAdmin: boolean = false;

  constructor(
    private modalService: NgbModal,
    private db: AngularFireDatabase,
    private localStorage: LocalStorageService,
    private comumService: ComumService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.loadType();

    this.comumService.path.subscribe(val => {
      this.loadType(val);
    })

    this.comumService.storeid.subscribe(val => {
      this.loadType();
    });

    this.changeUsertype(this.localStorage.get("pathArray"));
    this.comumService.pathArray.subscribe(val => {
      this.changeUsertype(val)
    })
  }

  changeUsertype(val) {
    if (val[0].account_type.id == 1)
      this.isAdmin = true;
    else
      this.isAdmin = false;
  }

  loadType(path = undefined) { // carrega os tipos de usuario

    if (!path)
      this.path = this.localStorage.get("path");
    else
      this.path = path;

    this.comumService.loading = true;
    this.dataService.getList('v1/accounttypes')
      .subscribe(val => {
        let tempType = [];
        val.result.forEach(element => {
          if ((element.id < 4 && this.isAdmin) || element.id >= 4)
            tempType.push(element);
        });

        this.accountTypeList = this.comumService.setSelect2(tempType, 'id', 'name', 'Selecione');

        //rotina de regras para insercao de tipos de usuarios multiplos
        let accountTypeListAux = [];
        let accountTypeNotPagalee = [];

        this.accountTypeList.forEach(element => { // filtrando opcoes de tipos de usuario disponíveis de acordo com o contratante selecionado 
          if ([1, 2].indexOf(parseFloat(element.id)) == -1) // nao inclui operador pagalee e adm pagalee enquanto nao verifica se o contratante e Pagalee
            accountTypeListAux.push(element);
          else
            accountTypeNotPagalee.push(element); // guarda elementos nao adicionados
        });
        this.accountTypeList = accountTypeListAux; // adiciona o temporario ao array ainda sem saber se o contratante é pagalee

        if (this.path.split('account_detail/')[1] == "ea2fc641-9ba7-e711-8f02-00155d003a02") { // caso o contrante seja pagalee, zera o array e adiciona somente os itens nao adicionados anteriormente (especificos para pagalee)
          this.accountTypeList = [];
          accountTypeNotPagalee.forEach(atp => {
            this.accountTypeList.push(atp);
          });
        }
        this.loadStore();
      });
  }

  loadStore() { // carrega lista de todas as lojas
    this.dataService.getList('v1/stores')
      .subscribe(val => {
        if (val.result) {
          let resp = val.result;
          resp.forEach(element => {
            this.db.object(this.path.split('account_detail')[0] + '/account_detail/' + element.account_detail_id).take(1).subscribe(a => {
              this.storeListTemp = this.comumService.setSelect2(val.result, 'id', 'trade_name', 'Selecione', true); // lista de todas as lojas
            })
          });
        }
        this.loadData();
      });
  }
  loadData() {
    this.db.list(this.path + "/account").subscribe(a => {
      this.comumService.loading = false;
      this.data = [];
      a.forEach(val => {
        let vl = val;
        vl["status"] = this.comumService.booleantoIco(vl.active);
        this.data.push(vl);
      });
    });
  }
  openModal(content, data) { // abre modal
    this.EditData = new Account();

    this.tableUserList = [];
    this.tempStore = [];
    this.pinArray = [];
    let pathArray = [];
    let accList = [];

    this.account_type_id = "";
    let contractNameAux = "";
    let accountDetAux = "";

    pathArray = this.localStorage.get('pathArray');
    pathArray.forEach(p => {
      if (p.account_detail_id != "ea2fc641-9ba7-e711-8f02-00155d003a02") // vai mostrar os tipos de usuarios que nao são pagalee
        accList.push({ id: p.account_detail_id, trade_name: p.trade_name, display_image: p.display_image });
    });
    this.accValues = this.comumService.setSelect2(accList, 'id', 'trade_name', '');

    if (data) { // editando usuario ja existente
      this.dataService.jsonToModel(data.row, new Account(), this.EditData);
      let tableUserListTemp = {};
      let arrStoresIDs = [];

      Object.keys(data.row.account_parent).map((key, index) => {
        if (data.row.account_parent[key].account_type_id == 5) { // montando a row para a tabela para um dono de loja
          tableUserListTemp = {
            name: data.row.account_parent[key].account_type.name,
            id: data.row.account_parent[key].account_type.id,
            account_detail_id: key,
            stores_ids: [],
            stores: ""
          };
          Object.keys(data.row.account_parent[key].account_store).map((key2, index2) => { // adicionando as lojas do dono separadas por vírgula somente para exibição
            tableUserListTemp['stores_ids'].push(data.row.account_parent[key].account_store[key2].store_id);
            if (tableUserListTemp['stores'] != "")
              tableUserListTemp['stores'] += ', ' + data.row.account_parent[key].account_store[key2].trade_name;
            else
              tableUserListTemp['stores'] = data.row.account_parent[key].account_store[key2].trade_name;
          });
          pathArray.forEach(p => {
            if (p.account_detail_id == data.row.account_parent[key].account_detail_id)
              tableUserListTemp['contract_name'] = p.trade_name; // capturando nome do contratante pelo path
          });
          this.tableUserList.push(tableUserListTemp); // jogando row montada para dono de loja para a tabela 
        }
        else { // montando a row para a tabela, caso nao seja dono de loja
          tableUserListTemp = {
            name: data.row.account_parent[key].account_type.name,
            id: data.row.account_parent[key].account_type.id,
            account_detail_id: data.row.account_parent[key].account_detail_id
          }
          pathArray.forEach(p => {
            if (p.account_detail_id == data.row.account_parent[key].account_detail_id)
              tableUserListTemp['contract_name'] = p.trade_name;
          });
          this.tableUserList.push(tableUserListTemp); // jogando row montada sem account_store, ou seja, qualquer tipo de usuario que nao seja dono de loja
        }
      });

      this.pinArray = this.EditData.pin_code.split('');
    } else // incluindo novo usuario (só abre a modal, não carrega dados)
      this.EditData.photo_url = this.comumService.noImg;

    this.comumService.modalReference = this.modalService.open(content, { backdrop: "static", size: "lg" });
    this.comumService.focusFirst();
    this.comumService.setWindowHeight(325); // setando tamanho fixo da modal
  }

  setType(type) { // setando tipo de usuario para posterior insercao na tabela
    this.account_type_id = parseFloat(type.value);

    if (type.value == 3 || type.value == 10 || type.value == 4 || type.value == 5) { // vai mostrar a combo de contratante para os tipos de usuario que nao sejam pagalee
      this.isContractNeeded = true;
      this.setAcc(this.accValues[0].id); // setando precarga do primeiro item do array ao abrir a tela (só para nao abrir vazio)
    } else
      this.isContractNeeded = false; // operador pagalee e administrador do pagalee, não vai mostrar a combo, o contratante pagalee será setado automaticamente (mocado)
  }

  setAcc(acc) { // setando contratante
    this.accVal = acc; // setando var com id do contratante
    let arrTempStore = [];
    this.storeListTemp.forEach(sl => { // carregando lista de lojas de acordo com o contratante selecionado (storeListTemp tem todas as lojas)
      if (sl.additional.account_detail_id == this.accVal)
        arrTempStore.push(sl);
    });
    this.storeList = arrTempStore;
  }

  setStore(store) { //setando store_id na tempStore, para posterior inserção na tabela
    this.tempStore = store.value;
  }

  deleteTableRow(rowObject) { // deleta row da table
    this.tableUserList = this.tableUserList.filter(tul => { return !(tul.name == rowObject.name && tul.contract_name == rowObject.contract_name && tul.stores == rowObject.stores) });
  }

  insertUserData() { // insere os dados setados nas combos de tipo de usuario, contratante e loja para tabela na parte inferior

    //limpando vars
    let ownerStores = "";
    let contractName = "";
    let pathArray = [];
    let ret = true;

    if (this.accVal == "" || this.accVal == undefined) // caso seja operador/administrador pagalee, setar o id do contratante manualmente (mock) 
      this.accVal = "ea2fc641-9ba7-e711-8f02-00155d003a02"; // mock

    if ((!this.accVal) && (this.isContractNeeded)) { // contratante obrigatorio mas nenhum foi digitado
      this.comumService.alertError('É obrigatório selecionar um contratante!');
      return false;
    }

    if ((this.tempStore.length == 0) && (this.isContractNeeded) && (this.account_type_id == 5)) { // nenhuma loja inserida para dono de loja
      this.comumService.alertError('Para cadastrar um dono de loja, ao menos uma loja deve ser adicionada!');
      return false;
    }

    this.tableUserList.forEach(tul => { //lista campos ja adicionados na tabela
      if (tul.account_detail_id == this.accVal) { //caso encontre contrato igual entra na edicao
        if (tul.id == '5') { //caso seja dono de loja ver se tem algum que ainda nao foi adicionado,caso nao seja dono de loja ou ache uma loja que ja foi adicionado, nao faz nada
          this.tempStore.forEach(tempid => {
            let has = false; //flag para saber se tem ou nao a loja no array de lojas
            tul.stores_ids.forEach(id => {
              if (tempid == id)
                has = true;
            });
            if (!has) 
              tul.stores_ids.push(tempid); //adiciona loja diferente
          });
        }
        ret = false;
      }
    });
    if (ret) { //insercao na tabela liberada
      pathArray = this.localStorage.get('pathArray');
      pathArray.forEach(p => { //pega nome do contratante 
        if (p.account_detail_id == this.accVal) 
          contractName = p.trade_name;
      });
      //cria objeto com campos padrões, getfieldfromarray pega o nome do tipo de usuario no array
      let elArr = { id: this.account_type_id, name: this.comumService.getFieldFromArray(this.accountTypeList, 'id', this.account_type_id, 'text'), account_detail_id: this.accVal, contract_name: contractName };
      if (this.account_type_id == '5') { //se for tipo 5 ele adiciona os arrays das lojas 
        elArr['stores_ids'] = [];
        elArr['stores_ids'] = this.tempStore;
      }
      this.tableUserList.push(elArr);
    }

    this.tableUserList.forEach(table => { //metodo padrao de edicao e inclusao para pegar o nome dos ids adicionados das lojas, apenas para tipo dono de loja
      if (table.id == 5) {
        table['stores'] = []; //zera os nomes para nao duplicar 
        this.storeListTemp.forEach(sl => {
          if ((table.stores_ids.includes(sl.additional.id))) {
            if (table['stores'] != '' && table['stores'] != undefined) //caso ja tenha ele concatena com a virgula
              table['stores'] += ', ' + sl.text;
            else 
              table['stores'] = sl.text;
          }
        });
      }
    });

    //limpa os campos do formulário
    this.accVal = "";
    this.accVal = "";
    this.tempStore = [];
    this.account_type_id = "";
  }

  saveData(tp) {
    this.comumService.loading = true;
    if (this.pinArray.length == 6)
      this.EditData.pin_code = this.pinArray[0] + this.pinArray[1] + this.pinArray[2] + this.pinArray[3] + this.pinArray[4] + this.pinArray[5];

    if (!this.validateFields()) { // validacao dos campos, NÃO APAGAR CASO ESTEJA COMENTADO (PODE ESTAR DESATIVADO MOMENTANEAMENTE!)
      this.comumService.loading = false;
      return false;
    }

    this.dataService.jsonToModel(this.EditData, new Account(), this.sendData);
    this.sendData.phone_number = '+' + this.sendData.phone_number.replace(/[^0-9]/g, "");
    this.sendData.unique_identifier = this.sendData.unique_identifier.replace(/[^0-9]/g, "");
    var tempAcc = {};
    var tempAccArray = {};
    var tempAccArrayStore = {};
    let cont = 0;
    tempAcc = {};

    //montando hash para enviar para o banco
    for (var i in this.tableUserList) { // varrendo a tabela 
      if (!tempAcc[this.tableUserList[i].account_detail_id]) { // a chave vai ser o id do contratante
        tempAcc[this.tableUserList[i].account_detail_id] = {
          "account_detail_id": this.tableUserList[i].account_detail_id,
          "account_type_id": this.tableUserList[i].id,
        };
      }
      if (this.tableUserList[i].id == 5) { // caso seja dono de loja, montando account_store
        if (!tempAcc[this.tableUserList[i].account_detail_id].account_store)
          tempAcc[this.tableUserList[i].account_detail_id].account_store = {};
        for (var j in this.tableUserList[i].stores_ids) {
          if (!tempAcc[this.tableUserList[i].account_detail_id].account_store[this.tableUserList[i].stores_ids[j]])
            tempAcc[this.tableUserList[i].account_detail_id].account_store[this.tableUserList[i].stores_ids[j]] = {};
          tempAcc[this.tableUserList[i].account_detail_id].account_store[this.tableUserList[i].stores_ids[j]] = { "store_id": this.tableUserList[i].stores_ids[j], "active": true };
        }
      }
    }

    this.sendData.account_parent = tempAcc; // jogando array com todos os hashs montados para dentro do account parent

    if (this.sendData.id == null) {
      this.dataService.getList('vi/accounts/email/' + this.sendData.email).subscribe(val => {
        if (val.result) {
          if (this.comumService.confirm("Este email já foi usado em outra conta, deseja associar este cadastro ao já existente?")) {
            var tempAcc = {};
            Object.keys(this.sendData.account_parent).map((key, index) => { //adicionando todas lojas de todas account_detail
              this.sendData.account_parent[key].account_id = val.result.id;
              val.result.account_parent[key] = this.sendData.account_parent[key];
            });
            this.sendData.account_parent = val.result.account_parent;
            this.sendData.id = val.result.id;
            this.doUpdate();
          }
        } else
          this.doInsert();
      });
    } else
      this.doUpdate();
  }
  doInsert() { // novo usuario
    this.dataService.addEntity(this.sendData, 'v1/accountdetails/' + this.path.split('account_detail/')[1] + '/accounts')
      .subscribe(val => {
        this.comumService.modalReference.close();
        this.comumService.loading = false;
      },
      Error => {
        this.comumService.errorModal('Ocorreu um Erro');
        //console.log(JSON.stringify(this.EditData));
        console.log(Error);
      }
      );
  }

  doUpdate() { // edicao de usuario
    this.dataService.update(this.sendData, 'v1/accounts/' + this.sendData.id)
      .subscribe(val => {
        this.comumService.modalReference.close();
        this.comumService.loading = false;
      },
      Error => {
        this.comumService.errorModal('Ocorreu um Erro');
        //console.log(JSON.stringify(this.sendData));
        console.log(Error);
      });
  }

  validateFields() { // validacao dos campos
    let valid = []

    valid = [
      [this.EditData.display_name, 'string', 'Nome'],
      [this.EditData.email, 'string', 'Email'],
      [this.EditData.phone_number, 'string', 'Telefone'],
      [this.EditData.unique_identifier, 'string', 'CPF']
    ];
    if (!this.EditData.id)
      valid.push([this.EditData.password, 'string', 'Senha']);
    switch (this.account_type_id) {
      case 1:
      case 2:
        valid.push([this.EditData.pin_code, 'string', 'Pincode']);
        break;
    }

    for (var i in valid) {
      if (!this.comumService.validField(valid[i][0], valid[i][1], valid[i][2]))
        return false
    }

    return true;
  }

  uploadDisplayImage(evt) { // upload foto do usuário
    var files = evt.target.files;
    var file = files[0];

    if (files && file) {
      var reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  _handleReaderLoaded(readerEvt) { // da continuidade a rotina de upload da foto do usuario, convertento para base64
    var binaryString = readerEvt.target.result;
    this.EditData.photo_url =
      "data:image/jpg;base64," + btoa(binaryString);
  }

  deleteData(tp) { // exclusão usuario
    this.comumService.loading = true;

    if (confirm('Você deseja mesmo excluir o usuário ' + this.EditData.display_name)) {
      this.dataService.delete('v1/accounts/' + this.EditData.id).subscribe(val => {
        this.comumService.modalReference.close();
        this.comumService.loading = false;
      },
        Error => {
          this.comumService.errorModal('Ocorreu um Erro');
          console.log(Error);
        });
    }
  }
  nextInputFocus(el) { //focus no campo
    el.select();
  }
}
