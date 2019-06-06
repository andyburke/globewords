'use strict';

const simplecoder = require( 'simplecoder' );

const DEFAULT_RESOLUTION = 0.00001;

module.exports = {
    _parse_float: function( value ) {
        try {
            const result = parseFloat( value );
            return !isNaN( result ) ? result : null;
        }
        catch( ex ) {
            return null;
        }
    },

    parse: function( input, resolution = DEFAULT_RESOLUTION ) {
        const args = input.split( /[,\s]+/g );
        const parsed_latitude = this._parse_float( args[ 0 ] );
        const parsed_longitude = this._parse_float( args[ 1 ] );
        
        return this.locate( {
            latitude: parsed_latitude,
            longitude: parsed_longitude,
            words: ( parsed_latitude !== null && parsed_longitude !== null ) ? [] : args
        }, resolution );
    },

    locate: function( input, resolution = DEFAULT_RESOLUTION ) {
        const result = Object.assign( {
            latitude: null,
            longitude: null,
            words: []
        }, input );

        if ( result.latitude !== null && result.longitude !== null ) {
            // calculate words
        
            let longitude = result.longitude + 180;
            let latitude = result.latitude + 90;
        
            let depth = 1;
            let longitude_offset_amount = ( 360 / 16 );
            let latitude_offset_amount = ( 180 / 16 );
        
            const word_values = [];
            do {
                const grid_longitude_offset = Math.floor( longitude / longitude_offset_amount );
                const grid_latitude_offset = Math.floor( latitude / latitude_offset_amount );
        
                const combined = ( ( grid_longitude_offset << 4 ) | grid_latitude_offset ) & 0xFF;
                word_values.push( combined );
        
                console.log( `(${ depth }): ${ grid_longitude_offset } x ${ grid_latitude_offset } * ( ${ longitude_offset_amount } x ${ latitude_offset_amount } ) ( ${ latitude - 90 }, ${ longitude - 180 } ) (( ${ latitude }, ${ longitude } ))` );
        
                longitude = longitude - ( grid_longitude_offset * longitude_offset_amount );
                latitude = latitude - ( grid_latitude_offset * latitude_offset_amount );
        
                console.log( `(${ depth }): (( ${ latitude }, ${ longitude } ))` );
        
                longitude_offset_amount /= 16;
                latitude_offset_amount /= 16;
        
                ++depth;
            } while( ( longitude >= resolution ) || ( latitude >= resolution ) );
        
            result.words = simplecoder.encode( word_values );
        }
        else {
            // calculate lat/lon
            const decoded = simplecoder.decode( result.words );
            let latitude = 0;
            let longitude = 0;
        
            let depth = 1;
            let longitude_offset_amount = ( 360 / 16 );
            let latitude_offset_amount = ( 180 / 16 );
        
            for ( const value of decoded.values() ) {
                const grid_longitude_offset = ( value & 0xF0 ) >> 4;
                const grid_latitude_offset = value & 0x0F;
                
                longitude += longitude_offset_amount * grid_longitude_offset;
                latitude += latitude_offset_amount * grid_latitude_offset;
        
                console.log( `${ value } (${ depth }): ${ grid_longitude_offset } x ${ grid_latitude_offset } * ( ${ longitude_offset_amount } x ${ latitude_offset_amount } ) ( ${ latitude - 90 }, ${ longitude - 180 } )` );
        
                ++depth;
                longitude_offset_amount /= 16;
                latitude_offset_amount /= 16;
            }
        
            result.longitude = longitude - 180;
            result.latitude = latitude - 90;
        }

        return result;
    }//,

    // get_polygons: function( start = 1, depth = 3 ) {
    //     let longitude_offset_amount = ( 360 / ( 16 * current_depth ) );
    //     let latitude_offset_amount = ( 180 / ( 16 * current_depth ) );

    //     const polygons = [];
    //     for( let current_depth = start; current_depth < ( start + depth ); ++current_depth ) {
    //         let depth_offset = [

    //         ]
    //         for( let i = 0; i < 256; ++i ) {

    //             const grid_longitude_offset = ( i & 0xF0 ) >> 4;
    //             const grid_latitude_offset = i & 0x0F;

    //             const polygon = {
    //                 depth: current_depth,
    //                 offset: [ ]
    //                 coords: [ grid_longitude_offset, grid_latitude_offset ],
    //                 bounds: [

    //                 ]

    //             }
                
    //             longitude += longitude_offset_amount * grid_longitude_offset;
    //             latitude += latitude_offset_amount * grid_latitude_offset;
        
    //             console.log( `${ value } (${ depth }): ${ grid_longitude_offset } x ${ grid_latitude_offset } * ( ${ longitude_offset_amount } x ${ latitude_offset_amount } ) ( ${ latitude - 90 }, ${ longitude - 180 } )` );
        
    //             ++depth;
    //             longitude_offset_amount /= 16;
    //             latitude_offset_amount /= 16;
    
    //         }
    //     }
    // }
};
