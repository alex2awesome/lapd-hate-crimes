wrap = function(text, width){ //, width, block_id) {
      text.each(function() {  
        var text = d3.select(this)
        var data = text.data()[0]
        if (! data['text']){
        	data = {
        		'text': data,
        		'width': width,
        		'id': 'wrapped-text'
        	}
        }
        var words = data['text'].split(/\s+/).reverse(),
            word,
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = 0
            tspan = text.text(null)
                          .append("tspan")
                          .attr("x", x)
                          .attr("y", y)
                          .attr("dy", dy + "em");

        word_id_counter = 0
        bold_state = false
        italic_state = false

        // TODO: Add parser to handle link tags.. 
        // link_state = false
        // <a href="http://www.yahoo.com">here</a>

        while (word = words.pop()) {
          // change state to bold 
          if (word.split('<b>').length > 1){
            bold_state = true
            word = word.replace('<b>','')
          }
          //change state to italic
          if (word.split('<em>').length > 1){
            italic_state = true
            word = word.replace('<em>','')
          }

          tspan.append('tspan')
                .attr('id', 'word' + '_' + word_id_counter + '_' + data['id'])
                .attr('font-weight', bold_state ? 'bold' : 'normal')
                .attr('font-style', italic_state ? 'italic' : 'normal')
                .text(
                  word.replace('</b>','').replace('</em>','').replace(new RegExp('<br>', 'g'), '')
                  + " "
                );

            // handle overflow
          if (tspan.node().getComputedTextLength() >= data['width']) {
            d3.select("#" + 'word' + '_' + word_id_counter + '_' + data['id']).remove();
            // handle edge case where line break and overflow occur at same time
            word = word.replace('<br>','')

            tspan = text.append("tspan")
                          .attr("x", x)
                          .attr("y", y)
                          .attr('id', 'wrap-text')
                          .attr("dy", ++lineNumber * lineHeight + dy + "em")
            
            tspan.append('tspan')
                  .attr('id', 'word' + '_' + word_id_counter + '_' + data['id'])
                  .attr('font-weight', bold_state ? 'bold' : 'normal')
                  .attr('font-style', italic_state ? 'italic' : 'normal')
                  .text(word.replace('</em>','').replace('</b>','').replace(new RegExp('<br>', 'g'), '') + " ");
            }

            // handle newline (can handle multiple)
          if ((total_br = word.split('<br>').length) > 1){
            lineNumber = lineNumber + (total_br - 1)
            tspan = text.append("tspan")
              .attr("x", x)
              .attr("y", y)
              .attr('id', 'wrap-text')
              .attr("dy", lineNumber * lineHeight + dy + "em")
          }
          
          //change state back to normal
          if (word.split('</b>').length > 1){
            bold_state = false
          }

          //change state back to normal
          if (word.split('</em>').length > 1){
            italic_state = false
          }

          word_id_counter = word_id_counter + 1
        }
      });
    }


//
// get the centers for motivation keys, dynamically
//
format_categorical_centers = function(counts, m_params, width){
	centers = {}
	row_group_size = m_params.ncols_even_row + m_params.ncols_odd_row
	for (i = 0; i < counts.length; i++ ){
	  key = counts[i]['key']
	  // row group
	  row_group = Math.floor(i / row_group_size)
	  col_in_row_group = i % row_group_size
	  // even row
	  if (col_in_row_group >= m_params.ncols_odd_row) {
	    col = col_in_row_group - m_params.ncols_odd_row 
	    row = row_group * 2 + 1
	    centers[key] = { x: col * width / m_params.ncols_even_row + m_params.woff_even,
	                     y: row * m_params.row_height + m_params.height_offset}
	  }
	  // odd row
	  else {
	    col = col_in_row_group
	    row = row_group * 2 
	    centers[key] = { x: col * width / m_params.ncols_odd_row + m_params.woff_odd, 
	                     y: row * m_params.row_height + m_params.height_offset}
	  }
	}
	return centers
}



///////////////////
// moving functions for force graph
//
move_down = function(alpha, that) {
  var target = that.down
  return function(d) {
      d.x = d.x + (target.x - d.x + that.scale_x(d.crime_category)) * (that.damper + 0.02) * alpha;
      d.y = d.y + (target.y - d.y + that.scale_y(d.crime_category)) * (that.damper + 0.02) * alpha;
    };
};

move_center = function(alpha, that) {
  var target = that.center 
  return function(d) {
      d.x = d.x + (target.x - d.x + that.scale_x(d.crime_category)) * (that.damper + 0.02) * alpha;
      d.y = d.y + (target.y - d.y + that.scale_y(d.crime_category)) * (that.damper + 0.02) * alpha;
    };
};

move_gender = function(alpha, that) {
  return function(d) {
      target = that.gender_centers[d.gender]
      d.x = d.x + (target.x - d.x + that.scale_x(d.crime_category)) * (that.damper + 0.02) * alpha;
      d.y = d.y + (target.y - d.y + that.scale_y(d.crime_category)) * (that.damper + 0.02) * alpha;
    };
};

move_race = function(alpha, that) {
  return function(d) {
      target = that.race_centers[d.race]
      d.x = d.x + (target.x - d.x + that.scale_x(d.crime_category)) * (that.damper + 0.02) * alpha;
      d.y = d.y + (target.y - d.y + that.scale_y(d.crime_category)) * (that.damper + 0.02) * alpha;
    };
};

move_crime_category = function(alpha, that) {
  return function(d) {
      target = that.crime_category_centers[d.crime_category]
      d.x = d.x + (target.x - d.x + that.scale_x(d.crime_category)) * (that.damper + 0.02) * alpha;
      d.y = d.y + (target.y - d.y + that.scale_y(d.crime_category)) * (that.damper + 0.02) * alpha;
    };
};

move_motivation = function(alpha, that) {
  return function(d) {
      target = that.motivation_centers[d.motivation]
      d.x = d.x + (target.x - d.x + that.scale_x(d.crime_category)) * (that.damper + 0.02) * alpha;
      d.y = d.y + (target.y - d.y + that.scale_y(d.crime_category)) * (that.damper + 0.2) * alpha;
    };
};