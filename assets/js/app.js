
    const URL = './tso-data-pb.json';

    let data = await fetch(URL);
        data = await data.json();
        data = data.devices;

    function Adress(adress, latitude, longitude, meters) {
        this.adress = adress;
        this.latitude = latitude;
        this.longitude = longitude;
        this.meters = meters;
    }

    //console.log(data);

    data = data
           .map(item => ({
               latitude: item.latitude,
               longitude: item.longitude,
               adressRu: item.fullAddressRu,
               city: item.cityEN
           }));
           //console.log(data);    
    
    let tso = document.querySelector('#tso-place');
    let placeMap = document.getElementById("mapPlace")

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
            
    } else { 
        console.log("Браузер не поддерживает геолокацию");
    }

    let coordsNear = [];
    
    function showPosition(position) {
        let lat = position.coords.latitude; 
        let lon = position.coords.longitude;
        console.log("Браузер поддерживает геолокацию");
        console.log(`latitude ${lon}; longitude ${lat}`);
        
        for (let item of data){
            let near = new Adress(item.adressRu, item.longitude, item.latitude, getDistanceFromLatLonInKm(lat, lon, item.longitude, item.latitude));
            coordsNear.push(near);
        };
        
        coordsNear = coordsNear
                        .sort((a, b) => a.meters > b.meters ? 1 : -1)
                        .filter((set => f => !set.has(f.adress) && set.add(f.adress))(new Set))
                        .slice(0, 5);

        for(let item of coordsNear){
            item.meters = Math.trunc(item.meters) + "m";
        }

        console.log(coordsNear);

        let map;
        DG.then(function () {
        map = DG.map('map', {
        center: [coordsNear[0].latitude, coordsNear[0].longitude],
        zoom: 20
        });
    
        for(let item of coordsNear){    
            DG.marker([item.latitude, item.longitude]).addTo(map).bindPopup(`${item.adress}`);
        }
        });
        
        
        tso.innerHTML += coordsNear.map(item => `
             <h5 class="my-3 p-2">
                <span>${item.adress},</span>
                <span>${item.meters}</span>
            </h5>
        `).join('');
        
    };



    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; 
        var dLat = deg2rad(lat2-lat1);
        var dLon = deg2rad(lon2-lon1); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = (R * c) * 1000;
        return d;
      }
      
      function deg2rad(deg) {
        return deg * (Math.PI/180)
      }
