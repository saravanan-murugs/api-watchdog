var ahcApp = angular.module('ahcApp', []);
ahcApp.controller('MainCtrl', function MainCtrl($scope,$http, $interval) {
    $scope.apilist = [];
    $scope.environment = "";
    $scope.addnewAPIModal = {alert:false,type:"success"}
    $scope.addnewenvModal = {alert:false,type:"success"};
    $scope.importPostmanModal = {alert:false,type:"success",button:""}
    this.envList = [];
    this.environment = {};
    this.addEnvButton = "";
    this.changeEnv  =(envName)=>{
        $scope.environment = envName;
    }
    // intialize environments
    this.importPostman = ()=>{
        $scope.importPostmanModal.button="disabled";
        var file = document.getElementById("postmanCollectionFile").files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                try{
                    $scope.importPostmanModal.alert = true;
                    $scope.importPostmanModal.type = 'success';
                    $scope.importPostmanModal.error = 'Valid file. Upload inprogress';
                    let tmpJson = JSON.parse(evt.target.result)
                    console.log('success');
                    $http.post("/api/postman/import",tmpJson).then(resp=>{
                        $scope.importPostmanModal.error = 'Upload success';
                        $scope.importPostmanModal.button="";
                        setTimeout(function(){
                            $scope.importPostmanModal = {alert:false,type:"success",button:""}
                            $('#importPostmanModal').modal('hide');
                        }, 800);                        
                    },resp=>{                
                        $scope.importPostmanModal.error = resp.data.error;
                        $scope.importPostmanModal.type="danger";
                        $scope.importPostmanModal.alert = true;
                        $scope.importPostmanModal.button="";
                        console.log("unable to import postman : "+resp.data.error);
                    });
                }catch(err){
                    $scope.importPostmanModal.alert = true;
                    $scope.importPostmanModal.type = 'danger';
                    $scope.importPostmanModal.error = "invalid json";
                }
                
            }
            reader.onerror = function (evt) {
                $scope.importPostmanModal.alert = true;
                    $scope.importPostmanModal.error = "Error occured. Please try again";
            }
        }
    }
    $http.get("/api/environments").then(resp=>{
        this.envList = resp.data
        console.log("env data :"+ JSON.stringify(this.envList));
        if(this.envList.length>0){
            $scope.environment = this.envList[0].name;
        }
    },resp=>{
        console.log("unable to retrieve environments");
        console.log(JSON.stringify(resp));
    });
    this.api = getAPIObjectTemplate($scope.environment);
    this.addAPIButton="";
    
    $http.get("/api/apis").then(resp=>{
        $scope.apilist = resp.data
    },resp=>{
        console.log("unable to retrieve api detials");
        console.log(JSON.stringify(resp));
    });
    this.addNewEnv =()=>{
        if(this.addEnvButton === ""){
            this.addEnvButton="disabled";
            if(!this.environment.name){
                $scope.addnewenvModal.error = "environment name required";
                $scope.addnewenvModal.type="danger";
                $scope.addnewenvModal.alert = true;
                this.addEnvButton="";
                return false;
            }
            $http.post("/api/environments",this.environment).then(resp=>{
                this.addEnvButton="";
                this.environment.status=true;
                this.envList.push(this.environment);
                $scope.environment = this.environment.name;
                $('#addenvmodal').modal('hide');
            },resp=>{                
                $scope.addnewenvModal.error = resp.data.error;
                $scope.addnewenvModal.type="danger";
                $scope.addnewenvModal.alert = true;
                this.addEnvButton="";
                console.log("unable to add environment : "+resp.data.error);
                this.environment.error=false;
            });
        }
    }
    this.addNewAPI = ()=>{
        if(this.addAPIButton === ""){
            this.addAPIButton="disabled";
            if(!this.api.apiname){
                $scope.addnewAPIModal.error = "api name required";
                $scope.addnewAPIModal.type="danger";
                $scope.addnewAPIModal.alert = true;
                this.addAPIButton="";
                return false;
            }
            if(!this.api.url){
                $scope.addnewAPIModal.error = "api url required";
                $scope.addnewAPIModal.type="danger";
                $scope.addnewAPIModal.alert = true;
                this.addAPIButton="";
                return false;
            }
            this.api.environment = $scope.environment;
            $http.post("/api/apis",this.api).then(resp=>{
                this.addAPIButton="";
                this.api = getAPIObjectTemplate($scope.environment);
                $scope.apilist.push(resp.data)  
                $('#addapimodal').modal('hide'); 
            },resp=>{
                $scope.addnewAPIModal.error = "Error Occurred : "+resp.data.error;
                $scope.addnewAPIModal.type="danger";
                $scope.addnewAPIModal.alert = true;
                this.addAPIButton="";
            });
        }
    }

    $interval(()=>{
        $http.get("/api/apis").then(resp=>{
            $scope.apilist = resp.data
        },resp=>{
            console.log("Get api failed");
        });
    },5000,0,true);
  });

const getAPIObjectTemplate = (environment)=>{
   let api=  {
    "apiname": "",
    "url": "",
    "method": "GET",
    "data": "",
    "requestContentType": "",
    "requestAcceptType": "",
    "statusCode": null,
    "statusMessage": "",
    "expectedJsonPath": "",
    "expectedXpath": "",
    "authType": "none",
    "oAuthClientId": "",
    "oAuthClientSecret": "",
    "oAuthScope": "",
    "basicAuthString": "",
    "basicUsername": "",
    "basicPassword": "",
    "authorizationHeader": "",
    "frequency": "",
    "environment": environment,
    "rejectUnauthorized": false
    };
      return api;
}
  /*

  {
    "apiname": "xplan",
    "url": "https://xplan-api.ucles.internal:8080/json",
    "method": "POST",
    "data": "{\"method\":\"XPlanThirdPartyServices.UserLogin\",\"params\":{\"Username\":\"Api\",\"Password\":\")FYW3cqGGmOm\"}}",
    "requestContentType": "application/json",
    "requestAcceptType": "application/json",
    "statusCode": 200,
    "statusMessage": "OK",
    "responseContentType": "application/json",
    "expectedJsonPath": "",
    "expectedXpath": "",
    "authType": "none",
    "oAuthClientId": "",
    "oAuthClientSecret": "",
    "oAuthScope": "",
    "basicAuthString": "",
    "basicUsername": "",
    "basicPassword": "",
    "authorizationHeader": "",
    "frequency": "",
    "rejectUnauthorized": false,
    "_id": "55d6d94755c34d658d6aba9372702a7c",
    "serverStatus": true,
    "serverStatusMessage": ""
  }
  */