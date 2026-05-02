import React from 'react';
import './CandidatoCard.css';

const CandidatoCard = ({ candidatos, onLike, onDislike }) => {
  if (!candidatos || candidatos.length === 0) return null;
  const esGrupo = candidatos.length > 1;
  return (
    <div className={`tarjeta-contenedor ${esGrupo ? 'tarjeta-doble' : 'tarjeta-simple'}`}>
      {esGrupo && <div className="badge-grupo">👯 Pack de Inquilinos</div>}
      <div className="perfiles-wrapper">
        {candidatos.map((candidato) => (
          <div key={candidato.id} className="perfil-seccion">
            <div className="foto-contenedor">
              <img 
                src={candidato.foto_perfil || 'https://via.placeholder.com/150'} 
                alt={`Foto de ${candidato.nombre}`} 
                className="foto-perfil" 
              />
            </div>
            <div className="info-candidato">
              <h3>{candidato.nombre}, {candidato.edad}</h3>
              <p className="profesion">💼 {candidato.profesion}</p>
              <p className="bio">"{candidato.bio}"</p>
            </div>
          </div>
        ))}
      </div>
      <div className="botones-accion">
        <button className="btn-rechazar" onClick={() => onDislike(candidatos)}>
          ❌ Descartar
        </button>
        <button className="btn-aceptar" onClick={() => onLike(candidatos)}>
          💚 Aprobar
        </button>
      </div>
    </div>
  );
};

export default CandidatoCard;