class NegociacaoController {

    constructor() {
        let $ = document.querySelector.bind(document);      

        this._inputData = $('#data');
        this._inputQuantidade = $('#quantidade');
        this._inputValor = $('#valor');
    };

    adiciona(event) {
        event.preventDefault();

        let negociacao = new Negociacao(            
            DateConverter.paraData(this._inputValor.value),
            parseInt(this._inputQuantidade.value),
            parseFloat(this._inputValor.value),
        );
        
        let diaMesAno = DateConverter.paraTexto(negociacao.data);        

        console.log(diaMesAno);
        
        console.log(negociacao.data);
        
    }
}