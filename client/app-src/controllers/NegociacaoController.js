import { Negociacoes, NegociacaoService, Negociacao } from '../domain/index.ts';
import { NegociacoesView, MensagemView, Mensagem, DateConverter } 
    from '../ui/index.ts';
import { getNegociacaoDao, Bind, getExceptionMessage } from '../util/index.ts';

export class NegociacaoController {

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

    async _init() {
        try {
            const dao = await getNegociacaoDao();
            const negociacoes = await dao.listaTodos();
            negociacoes.forEach(negociacao => this._negociacoes.adiciona(negocicao));
        } catch(err) {
            this._mensagem.texto = getExceptionMessage(err);
        }
    };

    async adiciona(event) {
       try {
            event.preventDefault();

            const negociacao = this._criaNegociacao();

            const dao = await getNegociacaoDao();
            await dao.adiciona(negociacao);
            this._negociacoes.adiciona(negociacao);
            this._mensagem.texto = 'Negociação adicionada com sucesso';        
            this._limpaFormulario();                               
       } catch(err) {
            this._mensagem.texto = getExceptionMessage(err);
       }
    }  

    async apaga() {
        try {
            const dao = await getNegociacaoDao();
            await dao.apagaTodos();
            this._negociacoes.esvazia();
            this._mensagem.texto = 'Negociações apagadas com sucesso';       
        } catch(err) {
            this._mensagem.texto = getExceptionMessage(err);
        }        
        
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

    async importaNegociacoes() {      
        try {
            const negociacoes = await this._service.obemNegociacoesDoPeriodo();
            console.log(negociacoes);
            negociacoes
                .filter(novaNegociacao => !this._negociacoes.paraArray()
                .some(negociacaoExistente => novaNegociacao.equals(negociacaoExistente)))
                .forEach(negociacao => this._negociacoes.adiciona(negociacao));
            this._mensagem.texto = 'Negociações do período importadas com sucesso.';
        } catch(err) {
            this._mensagem.texto = getExceptionMessage(err);
        }
    }

    
}