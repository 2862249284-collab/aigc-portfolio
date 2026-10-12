import * as THREE from 'three';

// Procedural stand-in: replaceable independently of rendering and pointer tracking.
export function createDollModel() {
  const root=new THREE.Group();
  const silver=new THREE.MeshStandardMaterial({color:0xc7c9cb,metalness:.91,roughness:.25});
  const ceramic=new THREE.MeshStandardMaterial({color:0xe0e0dc,metalness:.35,roughness:.29});
  const dark=new THREE.MeshStandardMaterial({color:0x090b0d,metalness:.25,roughness:.17});
  const white=new THREE.MeshBasicMaterial({color:0xffffff});
  const sphere=new THREE.SphereGeometry(1,40,28);
  function ball(parent,material,position,scale){const mesh=new THREE.Mesh(sphere,material);mesh.position.set(...position);mesh.scale.set(...scale);parent.add(mesh);return mesh;}
  const body=new THREE.Group();root.add(body);
  ball(body,silver,[0,-.40,0],[.64,.76,.45]);
  ball(body,ceramic,[0,-.38,.34],[.40,.43,.16]);
  const head=new THREE.Group();head.name='Head';head.position.y=.63;root.add(head);
  ball(head,silver,[0,0,0],[.97,.76,.60]);
  ball(head,dark,[0,-.03,.51],[.69,.39,.17]);
  const eyes=new THREE.Group();eyes.position.z=.665;head.add(eyes);
  for(const x of [-.25,.25]){
    ball(eyes,ceramic,[x,0,0],[.092,.153,.035]);
    ball(eyes,white,[x-.018,.055,.025],[.028,.045,.012]);
  }
  // Offset aerials make the silhouette recognizable without a branded character.
  const earLeft=ball(head,silver,[-.66,.71,-.04],[.21,.47,.20]);earLeft.rotation.z=.23;
  const earRight=ball(head,silver,[.66,.63,-.04],[.20,.35,.20]);earRight.rotation.z=-.25;
  const arms=[];
  for(const sign of [-1,1]){
    const arm=new THREE.Group();arm.position.set(sign*.61,-.2,0);arm.rotation.z=sign*.25;body.add(arm);
    ball(arm,silver,[sign*.12,-.31,.02],[.22,.46,.24]);arms.push(arm);
    ball(body,silver,[sign*.30,-1.04,.12],[.29,.28,.40]);
  }
  const badge=new THREE.Mesh(new THREE.TorusGeometry(.085,.014,8,32),dark);badge.position.set(0,-.27,.502);body.add(badge);
  return {root,head,eyes,arms};
}

export function disposeObject(root) {
  const geometries=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set();
  root.traverse(object=>{
    if(object.geometry)geometries.add(object.geometry);
    if(object.skeleton)skeletons.add(object.skeleton);
    for(const material of Array.isArray(object.material)?object.material:[object.material]){
      if(!material)continue;materials.add(material);
      for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
    }
  });
  textures.forEach(texture=>{texture.source?.data?.close?.();texture.dispose();});
  materials.forEach(material=>material.dispose());geometries.forEach(geometry=>geometry.dispose());skeletons.forEach(skeleton=>skeleton.dispose());
}
