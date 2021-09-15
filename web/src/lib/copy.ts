const copy = (string: string): void => {
  var aux = document.createElement("input");
  aux.value = string;
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
};

export default copy;
