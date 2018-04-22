var ahcApp = angular.module('ahcApp', []);
ahcApp.controller('MainCtrl', function MainCtrl($scope,$http, $interval) {
    $scope.apilist = [];
    $scope.environment = "";
    $scope.addnewenvModal = {alert:false,type:"success"};
    this.envList = [];
    this.environment = {};
    this.addEnvButton = "";
    this.changeEnv  =(envName)=>{
        $scope.environment = envName;
    }
    // intialize environments
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
            },resp=>{
                this.addEnvButton="";
                console.log("unable to add environment : "+resp.data.error);
                this.environment.error=false;
            });
        }
    }
    this.addNewAPI = ()=>{
        if(this.addAPIButton === ""){
            this.addAPIButton="disabled";
            $http.post("/api/apis",this.api).then(resp=>{
                this.addAPIButton="";
            },resp=>{
        
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
    "requestContentType": "text/xml",
    "requestAcceptType": "text/xml",
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
    "rejectUnauthorized": false,
    "_id": "78b42913b3ef404aa6254656d023b076"
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