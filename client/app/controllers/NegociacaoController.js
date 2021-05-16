class NegociacaoController {

    constructor() {
        const $ = document.querySelector.bind(document);
        this._inputData = $('#data');
        this._inputQuantidade = $('#quantidade');
        this._inputValor = $('#valor');     
        this._service = new NegociacaoService(); 
        
        this._negociacoes = new Bind(
            new Negociacoes(),
            new NegociacoesView('#negociacoes'),
            'adiciona','esvazia'
        );

        this._mensagem = new Bind(
            new Mensagem(),
            new MensagemView('#mensagemView'),
            'texto'
        );

        this._negociacoes = ProxyFactory.create(
            new Negociacoes(),
            ['adiciona','esvazia'],
            model => this._negociacoesView.update(model)
        );             

        this._negociacoesView = new NegociacoesView('#negociacoes');
        this._negociacoesView.update(this._negociacoes);

        this._mensagem = ProxyFactory.create(
            new Mensagem(),
            ['texto'],
            model => this._mensagemView.update(model)
        );
        
        this._mensagemView = new MensagemView('#mensagemView');
        this._mensagemView.update(this._mensagem);

        this._init();        

    };

    _init() {        
        getNegociacaoDao()
        .then(dao => dao.listaTodos())
        .then(negociacoes =>
            negociacoes.forEach(negociacao =>
                this._negociacoes.adiciona(negociacao)))
        .catch(err => this._mensagem.texto = err);
    }

    adiciona(event) {
       try {
            event.preventDefault();

            const negociacao = this._criaNegociacao();
        
            getNegociacaoDao()
            .then(dao => dao.adiciona(negociacao))
            .then(() => {
                this._negociacoes.adiciona(this._criaNegociacao());
                this._mensagem.texto = 'Negociação adicionada com sucesso';        
                this._limpaFormulario();
            })
            .catch(err => this._mensagem.texto = err);
            
       } catch(err) {
            console.log(err);
            console.log(err.stack);

            if (err instanceof DataInvalidaException) {
                this._mensagem.texto = err.message;
            } else {
                this._mensagem.texto = 'Um erro não esperado aconteceu. Entre em contato com o suporte';
            }
       }
    }  

    apaga() {
        getNegociacaoDao()
        .then(dao => dao.apagaTodos())
        .then(() => {
            this._negociacoes.esvazia();
            this._mensagem.texto = 'Negociações apagadas com sucesso';
        })
        .catch(err => this._mensagem.texto = err);
    }

    _limpaFormulario() {
        this._inputData.value = '';
        this._inputQuantidade.value = 1;
        this._inputValor.value = 0.0;
        this._inputData.focus();
    }

    _criaNegociacao() {
        return new Negociacao(
            DateConverter.paraData(this._inputData.value),
            parseInt(this._inputQuantidade.value),
            parseFloat(this._inputValor.value),
        );
    }

    importaNegociacoes() {      
        this._service
            .obemNegociacoesDoPeriodo()
            .then(negociacoes => {
                negociacoes
                    .filter(novaNegociacao => !this._negociacoes.paraArray()
                        .some(negociacaoExistente => novaNegociacao.equals(negociacaoExistente)))
                    .forEach(negociacao => this._negociacoes.adiciona(negociacao));
                this._mensagem.texto = 'Negociações do período importadas com sucesso.';
            })
            .catch(err => this._mensagem.texto = err);                  
    }

    
}