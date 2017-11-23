 var	file_JSON = "file://../resources/monkey.json";
function main()
{
 $(function(){
        $.getJSON(file_JSON,function(data){
            console.log('success');
            $.each(data.employees,function(i,emp){
                $('ul').append('<li>'+emp.firstName+' '+emp.lastName+'</li>');
            });
        }).error(function(){
            console.log('error');
        });
    });
//$.getJSON(file_JSON, function (data) {
//    $.each(data, function (index, value) {
//       console.log(value);
//    });
//});
////	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
////    camera.position.z = 1;
}




