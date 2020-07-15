load.initialize(async function() {});

load.action("Action", async function() {
    //print msg to log
    //load.log("Hello DevWeb");

    //----------------------------------------------VTS BLOCK--------------------------------------------
    const vtsClient = load.vtsConnect({
        server: "localhost",
        port: 8888,
    });
    //Insert Value in VTS
    const myColumn1 = vtsClient.createColumn("VSCodeTransactionName");
    const myColumn2 = vtsClient.createColumn("VSCodeTransactionTime");
    const myColumn3 = vtsClient.createColumn("VSCodeStartTime");
    //----------------------------------------------VTS BLOCK--------------------------------------------


    //----------------------------------------------ParameterValue----------------------------------------
    load.log(`${load.params.username}`);
    load.log(`${load.params.jobtitle}`);
    //----------------------------------------------ParameterValue----------------------------------------


    //----------------------------------------------DeclareTransaction------------------------------------
    let T00 = new load.Transaction("S01_DevWeb_VSCode_GET_T00");
    //----------------------------------------------DeclareTransaction------------------------------------

    T00.start();
    const request1 = new load.WebRequest({
        url: "https://reqres.in/api/users/2",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        resources: [],
        extractors: [
            new load.BoundaryExtractor("name", {
                "leftBoundary": "_name\":\"",
                "rightBoundary": "\"",
                "scope": "body",
                "occurrence": "load.ExtractorOccurrenceType.All"
            }),
            new load.BoundaryExtractor('first_name', 'first_name":"', '","'),
            new load.TextCheckExtractor("isSuccess1", "first_name"),
            new load.JsonPathExtractor("text", "$.ad.text")
        ],
        returnBody: true
    }).sendSync();
    //Error handling using TextCheckExtractor
    if (request1.extractors.isSuccess1) {
        T00.stop(load.TransactionStatus.Passed);
        //load.log(T00);
        const columnValues1 = vtsClient.setValues(["VSCodeTransactionName"], ["" + T00.name + ""], load.VTSPlacementType.sameRow);
        const columnValues2 = vtsClient.setValues(["VSCodeTransactionTime"], ["" + T00.duration + ""], load.VTSPlacementType.sameRow);
        const columnValues3 = vtsClient.setValues(["VSCodeStartTime"], ["" + T00.startTime + ""], load.VTSPlacementType.sameRow);
    } else {
        T00.stop(load.TransactionStatus.Failed);
        load.exit("iteration");
    }
    //Print response body
    load.log(request1.body);


    //----------------------------------------------CorrelationValue-------------------------------------
    load.log(`${request1.extractors['first_name']}`);
    load.log(`${request1.extractors.name[1]}`);
    load.log(`${request1.extractors['text']}`);
    //----------------------------------------------CorrelationValue-------------------------------------

    load.sleep(3);


    //----------------------------------------------DeclareDynamicTransaction-----------------------------
    let T05 = new load.Transaction(`S01_DevWeb_VSCode_POST_T05_${request1.extractors.first_name}`);
    //----------------------------------------------DeclareDynamicTransaction-----------------------------


    T05.start();
    const request2 = new load.WebRequest({
        url: "https://reqres.in/api/users",
        method: "POST",
        headers: { "Content-Type": "text/html; charset=utf-8" },
        resources: [],
        body: {
            "name": `${request1.extractors['first_name']}`, //replace static value to correlated value
            "job": `${load.params.jobtitle}` //replace statis value to parameter value
        },
        returnBody: true,
        handleHTTPError: (webResponse) => {
            if (webResponse.status === 201) {
                return false;
            }
        }
    }).sendSync();
    //Error handling using web response status
    if (request2.status === 201) {
        T05.stop(load.TransactionStatus.Passed);
        const columnValues1 = vtsClient.setValues(["VSCodeTransactionName"], ["" + T05.name + ""], load.VTSPlacementType.sameRow);
        const columnValues2 = vtsClient.setValues(["VSCodeTransactionTime"], ["" + T05.duration + ""], load.VTSPlacementType.sameRow);
        const columnValues3 = vtsClient.setValues(["VSCodeStartTime"], ["" + T05.startTime + ""], load.VTSPlacementType.sameRow);
    } else {
        T05.stop(load.TransactionStatus.Failed);
        load.exit("iteration");
    }

    load.sleep(3);

    let T10 = new load.Transaction("S01_DevWeb_VSCode_PUT_T10");

    T10.start();
    const request3 = new load.WebRequest({
        url: "https://reqres.in/api/users/2",
        method: "PUT",
        headers: { "Content-Type": "text/html; charset=utf-8" },
        resources: [],
        body: {
            "name": "Ashish Ashawan",
            "job": "Software Test Eng"
        },
        extractors: [
            new load.RegexpExtractor("status", "\"(.*?)At\":\".*Z\"")
            //"updatedAt":"2020-06-26T14:44:42.455Z"
        ],
        returnBody: true
    }).sendSync();
    T10.stop();
    const columnValues1 = vtsClient.setValues(["VSCodeTransactionName"], ["" + T10.name + ""], load.VTSPlacementType.sameRow);
    const columnValues2 = vtsClient.setValues(["VSCodeTransactionTime"], ["" + T10.duration + ""], load.VTSPlacementType.sameRow);
    const columnValues3 = vtsClient.setValues(["VSCodeStartTime"], ["" + T10.startTime + ""], load.VTSPlacementType.sameRow);
    //Print Regex Extractor value
    load.log(`Status: ${request3.extractors.status}`);
});

load.finalize(async function() {});