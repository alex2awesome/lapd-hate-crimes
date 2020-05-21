(function() {
  var BubbleChart, root,
  BubbleChart = (function() {

    function BubbleChart(data, time_series) {
      var max_amount;    
      this.state = null
      this.circle_state = 'deflated'

      // colors for when every bubble is the same
      this.starting_circle_fill = '#D4A017'
      this.starting_circle_stroke = d3.rgb(this.starting_circle_fill).darker();

      // colors for when bubbles are color-coded
      this.fill_color = {
        'gender': d3.scale.category20(), 
        'race': d3.scale.category20(),
        'motivation': d3.scale.category20(),
        'crime_category': d3.scale.category20(),
        'ages': function(d) { return '#D4A017' },
        'all': function(d) { return '#D4A017' }
      }

      // read in data
      this.data = data['result']['data'];
      this.time_series = time_series['result']['data'];

      //     
      standard_font = '13px'
      standard_mouseover_font = '12px'
      age_barchart_delayMax = 1000;
      this.layout_gravity = -0.01;
      this.damper = 0.1;
      this.nodes = [];
      this.radius = 5.5
      this.width = 940;
      this.margin = {
        'top': 20, 'right': 10, 'bottom': 20, 'left': 10
      };
      this.height = 500;
      this.tooltip = CustomTooltip("pulitzer_tooltip", 240);
      this.center = { x: this.width / 2, y: this.height / 2 };
      this.down = {'x': this.width / 2, 'y': 1500}


      this.annotation_data = {
        'all':
          [
                      {
                       'x': 10,
                       'y': 230,
                       'text': '<b>PULITZER GOLD:</b> Since 1917, 941 named winners have received journalism Prizes.',
                       'width': 200,
                       'alignment': "left",
                       'id': 1,
                       'font_size':'15px'
                      },
                      {
                       'x': 550,
                       'y': 470,
                       'text': '<em>Mouse over the dots to see details about individual winners.</em>',
                       'width': 200,
                       'alignment': "left",
                       'id': 'mouseover_text',
                       'font_size': standard_mouseover_font
                      },
          ],
          'race': [
                      {
                       'x': 10,
                       'y': 450,
                       'text': '<b>RACE \"UNKNOWN\"</b>: Journalism associations and other groups recorded the first African-American and Asian winners, and our own research located other early minority winners, but if we could not independently determine otherwise, any winners before 1960 were assumed to be white. After 1960, when more minorities began winning, if we could not confirm a winner\'s race, we labeled the person \"unknown.\"',
                       'width': this.width - 4 * this.margin.right,
                       'alignment': "left",
                       'id': 1,
                       'font_size': standard_font
                      },
                      {
                       'x': 600,
                       'y': 40,
                       'text': '<em>Mouse over the dots to see details about individual winners.</em>',
                       'width': 300,
                       'alignment': "left",
                       'id': 'mouseover_text',
                       'font_size': standard_mouseover_font
                      },
                    ],
          'gender':[
                      {
                       'x': 10,
                       'y': 150,
                       'text': '<b>WOMEN RISING:</b> <br> Women have won just 16 percent of journalism Pulitzers over the last century, but that is changing. In the last 10 years, women have taken home nearly a third of journalism Prizes.',
                       'width': 100,
                       'alignment': "left",
                       'id': 1,
                       'font_size': standard_font
                      },
                      {
                       'x': 550,
                       'y': 470,
                       'text': '<em>Mouse over the dots to see details about individual winners.</em>',
                       'width': 200,
                       'alignment': "left",
                       'id': 'mouseover_text',
                       'font_size': standard_mouseover_font
                      },
                    ],
          'crime_category':[
                      {
                       'x': 10,
                       'y': 60,
                       'text': '<b>Current Crime Categories</b>',
                       'width': 400,
                       'alignment': "left",
                       'id': 'current_crime_category',
                       'font_size': '16px'
                      },
                      {
                       'x': 10,
                       'y': 600,
                       'text': 'Crime Category Filler text', //'<b>Past Prize Categories</b>',
                       'width': 400,
                       'alignment': "left",
                       'id': 'past_crime_category',
                       'font_size': '16px'
                      },
                    ],
          'time':[
                  {
                       'x': 10,
                       'y': 60,
                       'text': '<b>Time Series Fill-In Text</b>',
                       'width': 400,
                       'alignment': "left",
                       'id': 'line_chart_annotation',
                       'font_size': '16px'
                      }
                  ],
          'ages':[
                  {
                       'x': this.width / 2,
                       'y': this.height - this.margin.bottom,
                       'text': 'Age of Victim (Years)',
                       'width': 400,
                       'alignment': "center",
                       'id': 'age_chart_xlabel',
                       'font_size': '16px'
                  },
                  {
                       'x': this.margin.left * 2,
                       'y': this.margin.top * 2,
                       'text': '<em>(Victims without recorded ages.<em>)',
                       'width': 400,
                       'alignment': "center",
                       'id': 'null_ages',
                       'font_size': '12px'                    
                  }
            ],
          'motivation':[
                  {
                       'x': 10,
                       'y': 60,
                       'text': '<b>Motivation Fill-In Text</b>',
                       'width': 400,
                       'alignment': "left",
                       'id': 'line_chart_annotation',
                       'font_size': '16px'
                      }
            ]
          }
      this.gender_map = {
           'M': 'Male',
           'F': 'Female',
           'X': 'Other'
      };
      this.gender_centers = {
        "Male": { x: this.width / 3, y: this.height / 3},
        "Female": { x: 2 * this.width / 3, y: this.height / 3 },
        "Other": { x: 2 * this.width / 3, y: 2 * this.height / 3 }
      };

      w_off = 120
      w_off_1 = 100
      h_off = 150
      this.race_map = {
          'H': 'Hispanic',
          'B': 'Black',
          'W': 'White',
          'X': 'Unknown',
          'O': 'Other',
          'A': 'Asian'
      };
      this.race_centers = {
        // top left
        "Black":                  { x: 0 * this.width / 3 + w_off,   y: 0 * this.height / 4 + h_off},
        // top middle
        "Other":                  { x: 1 * this.width / 3 + w_off,   y: 0 * this.height / 4  + h_off},
        // right
        "White":                  { x: 2 * this.width / 3 + w_off_1, y: this.height / 3 + 60},
        // bottom left
        "Unknown":                { x: 0 * this.width / 4 + w_off,   y: 2 * this.height / 3 },
        // bottom middle left
        "Hispanic":               { x: 1.2 * this.width / 3,  y: 2 * this.height / 3 },
        // middle middle
        "Pacific Islander":       { x: this.width / 3 , y: this.height / 2 },
        // bottom right
        "Asian":                  { x: 1.8 * this.width / 3,  y: 1.8 * this.height / 3 }
      };

      this.bias_code_mapping = {
        '1505': 'Mental Disability',
        '1506': 'Physical disability',
        '1507': 'Anti-female',
        '1508': 'Anti-male',
        '1509': 'Anti-Gender non-conforming',
        '1510': 'Anti-Transgender',
        '1511': 'Anti-American/Alaskan Native',
        '1512': 'Anti-Arab',
        '1513': 'Anti-Asian',
        '1514': 'Anti-Black or African American',
        '1515': 'Anti-Citizenship Status',
        '1516': 'Anti-Hispanic or Latino',
        '1517': 'Anti-Multiple Races (Group)',
        '1518': 'Anti-Native Hawaiian or Other Pacific Islander',
        '1519': 'Anti-Other Race/Ethnicity/Ancestry',
        '1520': 'Anti-White',
        '1521': 'Anti-Atheism/Agnosticism',
        '1522': 'Anti-Buddhist',
        '1523': 'Anti-Catholic',
        '1524': 'Anti-Eastern Orthodox (Russian/Greek/Other)',
        '1525': 'Anti-Hindu',
        '1526': 'Anti-Islamic (Muslim)',
        '1527': 'Anti-Jehovah’s Witness',
        '1528': 'Anti-Jewish',
        '1529': 'Anti-Mormon',
        '1530': 'Anti-Multiple Religions Group',
        '1531': 'Anti-Other Christian',
        '1532': 'Anti-Other Religion',
        '1533': 'Anti-Protestant',
        '1534': 'Anti-Sikh',
        '1535': 'Anti-Bisexual',
        '1536': 'Anti-Gay (Male)',
        '1537': 'Anti-Heterosexual',
        '1538': 'Anti-Lesbian',
        '1539': 'Anti-Lesbian/Gay/Bisexual or Transgender (Mixed Group)',
      }

      // crime type params
      this.height_expanded = 800
      var w_1 = 4,
          w_2 = 5,
          w_3 = 3,
          h = 6,
          woff = 80,
          woff_1 = 90
          woff_2 = 120
          hoff = 180
          h_off_past = 70
      this.height_expanded_window = this.height_expanded


      this.crime_category_centers = {
          // current prizes
          // first row 
          'Aggravated assault' :                        {x: 0 * this.width / w_1 + woff_2, y: 0 * this.height_expanded / h + hoff},
          'Criminal threats' :                          {x: 1 * this.width / w_1 + woff_2, y: 0 * this.height_expanded / h + hoff},
          'Vandalism':                                  {x: 2 * this.width / w_1 + woff_2, y: 0 * this.height_expanded / h + hoff},
          'Simple assault' :                            {x: 3 * this.width / w_1 + woff_2, y: 0 * this.height_expanded / h + hoff},
          //second row
          'Miscellaneous crime' :                       {x: 0 * this.width / w_2 + woff, y: 1 * this.height_expanded / h + hoff},
          'Other assault':                              {x: 1 * this.width / w_2 + woff, y: 1 * this.height_expanded / h + hoff},
          'Brandish a weapon' :                         {x: 2 * this.width / w_2 + woff, y: 1 * this.height_expanded / h + hoff},
          'Robbery':                                    {x: 3 * this.width / w_2 + woff, y: 1 * this.height_expanded / h + hoff}, 
          'Crime against children':                     {x: 4 * this.width / w_2 + woff, y: 1 * this.height_expanded / h + hoff},
          //third row
          'Lewd letter/telephone call' :                {x: 0 * this.width / w_2 + woff_1, y: 2 * this.height_expanded / h + hoff},
          'Trespassing':                                {x: 1 * this.width / w_2 + woff_1, y: 2 * this.height_expanded / h + hoff},
          'Threatening letter/telephone call':          {x: 2 * this.width / w_2 + woff_1, y: 2 * this.height_expanded / h + hoff},
        }

      this.m_params = {
            'ncols_even_row': 3,
            'ncols_odd_row': 2,
            'woff_even': 160,
            'woff_odd': 110,
            'row_height': 130,
            'height_offset': 100
      }

      this.process_data();
      this.create_vis();
    }

    BubbleChart.prototype.process_data = function() {
      var that = this 
      ////=================================
      // process data for bubblechart
      ////=================================
      var nodes = []
      var age_counts = {}
      var crime_categories = {}
      this.data.map(function(d, i) {
          age_bucket = d['vict_age']
          var node = {
              datum_id:       i,
              radius:         that.radius,
              crime_category: d['small_bundle_name'],
              name:           d['neighborhood'],
              gender:         (that.gender_map[d['vict_sex']] || 'Other'),
              race:           (that.race_map[d['vict_descent']] || 'Other'),
              year:           d['date_occ'],
              age:            d['vict_age'],
              motivation:     that.get_mo_code(d['mocodes']),
              age_idx:        (age_counts[age_bucket] || 0),
              x:              (Math.random() - .5) * 1500,
              y:              (Math.random() - .5) * 980,
              // x: that.scale_x(d['small_bundle_name']) * 20 + (Math.random() - .5) * 1500,
              // y: that.scale_y(d['small_bundle_name']) * 20 + (Math.random() - .5) * 980,
              opacity: 1,
          }
          age_counts[age_bucket] = (age_counts[age_bucket] || 0) + 1 
          crime_categories[d['small_bundle_name']] = true
          nodes.push(node)
        })
      this.nodes = nodes
      this.crime_categories = d3.keys(crime_categories)
      this.scale_x = d3.scale.ordinal().domain(this.crime_categories).rangePoints([-20, 20]);
      this.scale_y = d3.scale.ordinal().domain(d3.shuffle(this.crime_categories)).rangePoints([-20, 20]);


      // ================================
      // process data for time series
      ////===============================
      parseTime = d3.time.format("%Y-%m").parse
      this.time_series.forEach(function(d){
        d.date = parseTime(d.year + '-' + d.month)
        d.count = parseFloat(d.crime_count) 
      })
      // this.time_series.sort(function(a,b){return b.maxCount - a.maxCount})

      // =================================
      // proces data for age
      // =================================
      this.ages = d3.keys(age_counts).map(function(d){return parseInt(d)})
      this.max_age_count = d3.max(d3.values(age_counts))

      // age bargraph initialization
      this.age_linear_x = d3.scale.linear()
                              .domain([d3.min(this.ages), d3.max(this.ages)])
                              .range([0 + that.margin.left, that.width - that.margin.right], 10)
      this.age_linear_y = d3.scale.linear()
                              .domain([0, that.max_age_count])
                              .range([that.height - 3 * that.margin.bottom, 0 - 12 * that.margin.top])

      this.age_null_details = {
        'x_start': this.margin.left * 3,
        'y_start': this.margin.top * 3,
        'n_rows': 3,
        'n_null': age_counts[0]
      }

      // ================================
      // process data for motivation
      // ================================
      this.motivation_counts = d3.nest()
                                .key(function(d){return d.motivation})
                                .rollup(function(v) { return v.length})
                                .entries(this.nodes)
                                .sort(function(x, y){ return d3.descending(x.values, y.values); })

      this.motivation_centers = format_categorical_centers(
        this.motivation_counts, this.m_params, this.width
      )
      this.motivation_height = (
        (this.motivation_counts.length / (this.m_params.ncols_odd_row + this.m_params.ncols_even_row)) 
        * this.m_params.row_height * 2 
        + this.m_params.height_offset
      )

      // ----------------------------------
      // process data for crime-type
      // ----------------------------------
      this.crime_type_counts = d3.nest()
                                .key(function(d){return d.crime_category})
                                .rollup(function(v) {return v.length})
                                .entries(this.nodes)
                                .sort(function(x, y){ return d3.descending(x.values, y.values); })
      this.crime_category_centers = format_categorical_centers(
        this.crime_type_counts, this.m_params, this.width
      )
      this.crime_type_height = (
        (this.crime_type_counts.length / (this.m_params.ncols_odd_row + this.m_params.ncols_even_row)) 
        * this.m_params.row_height * 2 
        + this.m_params.height_offset
      )
    };

    BubbleChart.prototype.get_mo_code = function(row){
      var that = this;
      var output = 'No Motivation'
      Object.entries(that.bias_code_mapping).forEach(function(item){
        if(row.includes(item[0])){
          output = item[1]
        }
      })
      return output
    }

    BubbleChart.prototype.create_vis = function() {
        var that = this;
        this.vis = d3.select("#vis")
                      .append("svg")
                      .attr("width", this.width)
                      .attr("height", this.height)
                      .attr("id", "svg_vis");

        this.circles = this.vis.selectAll("circle").data(this.nodes);

        this.circles.enter()
              .append("circle")
              .attr("r", 0)
              .attr("fill", that.starting_circle_fill )
              .attr("stroke-width", 1.5)
              .attr('opacity', function(d) { return d.opacity }) 
              .attr("stroke", that.starting_circle_stroke )
              .attr("id", 'winners')
              .on("mouseover", function(d, i) { 
                d3.selectAll('#mouseover_text').transition().duration(2000).attr('opacity',0);
                return that.show_details(d, i, this); 
              })
              .on("click", function(d, i) { return that.show_details(d, i, this); })
              .on("mouseout", function(d, i) { return that.hide_details(d, i, this); });


          this.inflate_circles()

          // ## append mouseover div
          this.tooldiv = d3.select("body").append("div")   
              .attr("class", "tooldiv")               
              .style("display", "none");

      }

    ///
    // some mechanics
    ///

    // reinstate circles after showing timelines
    BubbleChart.prototype.inflate_circles = function() {
      if (this.circle_state == 'deflated'){
        if (this.state == 'all'){

        } else {
          this.circles.transition()
                      .duration(2000)
                      .attr("r", function(d) { return d.radius; });
        }
          this.circle_state = 'inflated'
      }
    };



    BubbleChart.prototype.charge = function(d) {
          // -3.78125 for radius 5.5
        return -Math.pow(d.radius, 2.0) / 8
      };

    BubbleChart.prototype.start = function() {
        return this.force = d3.layout.force()
                              .nodes(this.nodes)
                              .size([this.width * .7, this.height * .7]);
      };

    //////////////////////////////////////////////////////////////////////
    //// //////   //   ////////  //////  //     //////    //  //
    //// //   //  //   //        //  //  //     //  //     ///
    //// //   //  //   --- //    //////  //     //////      //
    //// /////    //  ///////    //      /////  //  //      //
    //////////////////////////////////////////////////////////////////////

    /////////
    // display and move function
    /////////
    BubbleChart.prototype.display_bubbles = function() {
        var that = this 
        this.change_circle_color()
        d3.selectAll('.request').transition().attr('opacity', 0)
        $('.request').remove();
        $('.x.axis').remove();
        $('.line').remove();
        $('.arc').remove();

        d3.select('.background').remove()
        d3.selectAll('.subunit').remove()
        d3.selectAll('.legend').remove()
        d3.selectAll('.pulitzer-winners').remove()
        d3.selectAll('.annotation_text').remove()

        this.start_force(false)
        this.annotation_text()
        this.hide_label();
    }

    ///////////////////////////////////////////////
    // move functions
    ///////////////////////////////////////////////
    BubbleChart.prototype.start_force = function(aggregate){
      var that = this
      var target_func = this.get_target_function()
      var alpha_mult = 1
      this.force.gravity(that.layout_gravity)
        .chargeDistance(500)
        .friction( 0.9 )
        .on("tick", function(e) {
                that.circles
                    .each(target_func(e.alpha * alpha_mult, that))
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; })
            })
        .charge( that.charge )
      this.force.start();
    }

    BubbleChart.prototype.make_age_chart = function(){
      that = this 
      that.force.stop()
      // exit
      d3.selectAll('.request').transition().attr('opacity', 0)
      $('.request').remove();
      $('.x.axis').remove();
      $('.arc').remove();

      d3.select('.background').remove()
      d3.selectAll('.subunit').remove()
      d3.selectAll('.legend').remove()
      d3.selectAll('.pulitzer-winners').remove()
      d3.selectAll('.annotation_text').remove()
      // enter
      that.change_circle_color()
      that.annotation_text()

      var xAxis = d3.svg.axis()
          .scale(this.age_linear_x)
          .orient("bottom");

      this.vis.append("g")
          .attr("class", "age_chart x axis")
          .attr("transform", "translate(0," + (that.height - 2.8 * that.margin.bottom) + ")")
          .call(xAxis);

      n_null_cols = Math.floor(that.age_null_details.n_null / that.age_null_details.n_rows)

      this.circles
        .transition()
        .duration(1000)
        .delay(function(d){
          return Math.random() * age_barchart_delayMax;
        })
        .attr('cx', function(d){
          if (d.age != 0){
            d.x = that.age_linear_x(d.age) // xScale(d.label) + xLocalScale(d.idx % barWidth) + radius + mar
            return d.x
          } else {
            d.x = that.age_null_details.x_start + (2 * that.radius * Math.floor(d.age_idx / that.age_null_details.n_rows))
            return d.x 
          }
        })
        .attr('cy', function(d){
          if (d.age != 0){
            d.y = (that.height - 3 * that.margin.bottom) - ( d.age_idx * 2 * d.radius)
            // d.y = that.age_linear_y(d.age_idx) // yScale(Math.floor((d[time].idx + 0.1) / barWidth)) - radius - mar
            return d.y
          } else {
            d.y = that.age_null_details.y_start + (2 * that.radius * (d.age_idx % that.age_null_details.n_rows))
            return d.y
          }
        })
        .attr('r', function(d) { return that.radius })
        .style('fill', function(d){
          return that.fill_color;
        });

    }

    ///////////
    // Display the labels for the Race/Gender Categories
    //////////
    BubbleChart.prototype.display_cluster_label = function() {
      that = this
      // set positions if we're transition to gender
      if (this.state == 'gender') { 
            var position = {
                  "Male":              { x: 160,                  y: 40 },
                  "Female":            { x: this.width - 160,     y: 40 }
            };
      } // set positions if we transition to race
      if (this.state == 'race') {
            var position = {
                  // top
                  "Black":             { x: 160,                   y: 40 },
                  "Other":             { x: this.width / 2 - 100,  y: 40 },
                  "White":             { x: this.width - 100,      y: 40 },
                  // bottom
                  "Unknown":           { x: 160,                   y: this.height  - 40 },
                  "Hispanic":          { x: 120 + this.width / 4,  y: this.height - 40 },
                  "Pacific Islander":  { x: 120 + this.width / 2,  y: this.height - 40 },
                  "Asian":             { x: this.width - 160,      y: this.height - 40 }
                };
      } 
      if (this.state == 'crime_category')
        var position = this.crime_category_centers

      if (this.state == 'motivation')
        var position = this.motivation_centers

      var labels = d3.keys(position);
      var legend = this.vis.selectAll("labels").data(labels);
      legend.enter()
              .append("text")
              .attr("class", "labels")
              .attr('id', function(d){ return d })
              .attr("x", function(d) { return position[d]['x']; })
              .attr("y", function(d) { return position[d]['y']})
              .attr("text-anchor", "middle")
              .text(function(d) { return d; })
              .call(that.wrap, 250)
              ;

    };


    // Generic hide-label function 
    BubbleChart.prototype.hide_label = function() {
      d3.selectAll(".labels").transition().attr('opacity',0);
      $(".labels").remove();
    };

    /////////
    // tooltip handling
    /////////
    BubbleChart.prototype.show_details = function(data, i, element) {
      var content;
      d3.select(element).attr("stroke", "black");
      content = "<span class=\"name\">" + data.name + "</span><span class=\"value\"> (" + data.year + ")</span><br/>";
      content += "<span class=\"name\"><em>" + data.paper + "</em></span><br/>";
      return this.tooltip.showTooltip(content, d3.event);
    };

    BubbleChart.prototype.hide_details = function(data, i, element) {
      var that = this 
      d3.select(element).attr("stroke", function(d) {
        return d3.rgb(that.fill_color[ that.state ](d[ that.state ])).darker()
      })
      return this.tooltip.hideTooltip();
      };

    // transition into line graph over time
    BubbleChart.prototype.remove_circles = function(){
      var that = this
      this.circles
            .transition()
            .duration(400)
            .attr('r',0)
      this.circle_state = 'deflated'
    }

    // Generic hide-label function 
    BubbleChart.prototype.change_toggle_active = function(id, index) {
        d3.selectAll(id).attr('class', function(d,i){ return (d==index) ? 'btn active' : 'btn' })
    };

    // ========================================================
    // handles changes in circle color and radius
    // ========================================================
    BubbleChart.prototype.change_circle_color = function(){
      var that = this
      if (this.state != 'all'){
            this.circles
                  .transition()
                  .duration(400)
                  .attr("fill", function(d) {
                      return that.fill_color[ that.state ](d[ that.state ])
                  })
                  .attr("stroke", function(d) {
                      return d3.rgb(that.fill_color[ that.state ](d[ that.state ])).darker();
                  })
                  .attr('r', function(d) { return that.radius })
                  .attr('opacity', 1)
          }
      else if ((this.state == 'all') & (this.move_override != null)) {
        this.circles
              .transition()
              .duration(400)
              .attr("fill", that.starting_circle_fill)
              .attr("stroke", that.starting_circle_stroke)
              .attr('r', that.radius)
        }
      }

    BubbleChart.prototype.get_target_function = function(){
      var that = this 
      var target_func = that.move_override ? move_down : move_center 
      if (that.move_override == null){
        if (that.state == 'gender')
          target_func = move_gender

        else if (that.state == 'race')
          target_func = move_race

        else if (that.state == 'crime_category')
          target_func = move_crime_category

        else if (that.state == 'motivation')
          target_func = move_motivation
      }
      return target_func
    }

    BubbleChart.prototype.show_individuals = function(){
      var that = this 
      if (this.state=='all'){
            this.circles
                  .transition()
                  .duration(500)
                  .attr('r', that.radius )
                  .attr("fill", that.starting_circle_fill)
                  .attr("stroke", that.starting_circle_stroke)
      } else {
            this.circles
                  .transition()
                  .duration(500)
                  .attr('r', that.radius )

            this.start_force(false)
            }
      }

    BubbleChart.prototype.wrap = wrap
    BubbleChart.prototype.annotation_text = function() {
      var that = this
      data = this.annotation_data[this.state]
      this.vis.selectAll('#annotation_text')
            .data(data)
          .enter().append('text')
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
            .attr('class', 'annotation_text')
            .attr('id', function(d) {return d.id; })
            .attr("text-anchor", function(d) { return d.alignment; })
            .text( function(d) { return d.text; })
            .style('font-size', function(d) {return d.font_size; })
            .call(that.wrap);
    }

    // # ---
    // # Code to transition to Stacked Area chart.
    // # ---
    BubbleChart.prototype.make_linear_chart = function() {
      // # first, lets setup our x scale domain
      // # this assumes that the dates in our data are in order
      var that = this
      var inner_height = that.height * .92

      // formate x-axis and xscale
      this.linear_x = d3.time.scale()
              .range([0, that.width])
              .domain(d3.extent(this.time_series, function(d) { return d.date; }));
      dates = this.time_series.map(function(d){return d.date})
      dates = dates.filter(function(d, i){ return i % 12 == 0; })
      this.linear_xAxis = d3.svg.axis()
        .scale(this.linear_x)
        .tickSize(-this.height + 100)
        .tickFormat(d3.time.format('%Y'));
      this.linear_xAxis.tickValues(dates)


      // format y-axis and yscale 
      min_count = 0
      max_count = d3.max(this.time_series, function(d) { return d.count; })
      this.linear_y = d3.scale.linear()
            .range([inner_height, 10])
            .domain([min_count, max_count])
      this.linear_yAxis = d3.svg.axis()
                .scale(this.linear_y)
                .orient("left")
                .tickSize(10)
                .tickValues(d3.range(0, max_count, d3.max([1, parseInt(max_count/15)])));

      // this.area = d3.svg.area()
      //     .interpolate("basis").tension(.2)
      //     .x(function(d) { return that.linear_x(d.date) })

      this.line = d3.svg.line()
          .interpolate("basis").tension(.2)
          .x(function(d) { return that.linear_x(d.date) })
          .y(function(d) { return that.linear_y(d.count) })
      
      this.vis.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (inner_height - 10) + ")")
        .call(that.linear_xAxis)

      this.vis.append("g")
        .attr("class", "y axis")
        .call(that.linear_yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Index");

      this.vis.append("path")
        .datum(this.time_series)
        .attr("class", "line")
        .attr("d", that.line);

      // this.vis
      //     .transition().duration(750)
      //     .selectAll(".line")
          // .attr("d", that.line);
         // .style("stroke",c(region));
    
      // trans1.selectAll(".label").attr("transform", transform).text(region);

    }

    BubbleChart.prototype.stackedAreas = function(data_input, height) {
      // ## add in vertical overlay line
      vertical = this.vis.append("div")
                    .attr("class", "remove")
                    .style("position", "absolute")
                    .style("z-index", "19")
                    .style("width", "1px")
                    .style("height", this.height)
                    .style("top", "120px")
                    .style("bottom", "0px")
                    .style("left", "0px")
                    .style("background", "#D3D3D3");

      var that = this 
      inner_width = that.width

      this.stack.offset("zero")
      // # re-run the layout on the data to modify the count0
      // # values
      this.stack(data_input)

      this.linear_y.domain([0, d3.max(data_input[0].values.map(function(d) {return d.count0 + d.count}))])
        .range([height, 0])

      this.line.y(function(d){ return  this.linear_y(d.count0)})
      this.area
        .y0(function(d){ return this.linear_y(d.count0)})
        .y1(function(d){ return this.linear_y(d.count0 + d.count)})

      t = this.vis.selectAll(".request")
        .transition()
        .duration(1000)

      t.select("path.line")
        .style("stroke-opacity", 1e-4)
        .attr("d", function(d){ return that.line(d.values)})

      t.select("path.area")
        .style("fill-opacity", 1.0)
        .attr("d", function(d){ return that.area(d.values)})


      function mouseover(d){
        d3.select('.tooldiv').style("display", "inline")
        d3.select('#mouseover_text').remove()
      }

      function mousemove(d, i){
        mousex = d3.mouse(this)[0]
        d3.select('.tooldiv').style("display", "inline")
        increments = inner_width / d.values.length
        idx = Math.floor( mousex / increments )
        elem = d.values[idx - 1]
        d3.select('.tooldiv').html(
          '<b>'+d.key+': </b><em>('+elem.date.getFullYear()+")<br></em> "+'Prize Count: '+ elem.count
          ).style("left", (d3.event.pageX - 34) + "px")
           .style("top", (d3.event.pageY - 18) + "px")
        parent.vertical.style("left", d3.event.pageX - 5 + "px")
      }

      function mouseout(parent){
        d3.select('.tooldiv').style("display", "none")
        d3.selectAll(".request")
              .transition()
              .duration(250)
              .attr("opacity", .8);
        }

      d3.selectAll('.area')
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)

      d3.selectAll(".request")
        .attr('opacity', .5)
        .on('mouseover', function(d, i){
                  that.vis.selectAll(".request")
                      .transition()
                      .duration(250)
                      .attr("opacity", function(d, j){ return j != i ? 0.5 : .8} )
        })
    }

      // # ---
      // # Helper function that creates the 
      // # legend sidebar.
      // # ---
      BubbleChart.prototype.createLegend = function() {
        var legendRectSize = 18;
        var legendSpacing = 40;
        var offset = 100
        var color = this.fill_color[ this.state ]
        var last = 0 
        var next_6 = 0
        var last_6 = 0
        var legend = this.vis.selectAll('.legend')
          .data(color.domain())
          .enter()
          .append('g')
          .attr('class', 'legend')
          .attr('transform', function(d, i) {
              var bottom = 0
              var height = legendRectSize + legendSpacing;
              var offset = height * color.domain().length / 2;
              var horz =  (last * 5.5) + (1.2 * i * legendSpacing)
              var vert = height // - offset;
              last = last + d.length
              return 'translate(' + horz + ',' + bottom + ')';// (vert + bottom) + ')';
          });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', function(d) {return color(d)})
            .style('stroke', function(d) {return color(d)});

        legend.append('text')
          .attr('x', legendRectSize + 8)
          .attr('y', legendRectSize - 5)
          .text(function(d) { return d; });   
      }

  return BubbleChart;
})();


//   ===    //////   /////    ===   //
//   ===    /     //     /    ===   //
//   ===    /  //    //  /    ===   //
//   ===    /  / /  / /  /    ===   //
//   ===    /  /  /   /  /    ===   //
//   ===    ////      ////    ===   //


//////// =======================================
// Run main function 
///////=========================================
  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  $(function() {
    var chart, render_vis;
    chart = null;

    render_vis = function(error, data_json, time_series) {
      chart = new BubbleChart(data_json, time_series);
      chart.state = 'all'
      chart.start();
      chart.display_bubbles();
    };


    root.toggle_view = function(view_type) {
        chart.state = view_type

        if (view_type === 'race') {
          d3.select('#subheader').html('<em>Breakdown by Race/Ethnicity</em>')
          chart.display_bubbles();
          chart.createLegend()
          chart.vis.on('click', null);

        } else if (view_type === 'gender') {
          d3.select('#subheader').html('<em>Breakdown by Sex/Gender</em>')
          chart.display_bubbles();
          chart.createLegend()
          chart.vis.on('click', null);

        } else if (view_type === 'crime_category') {
          d3.select('#subheader').html('<em>Breakdown by Crime Category</em>')
          chart.display_bubbles();
          chart.display_cluster_label();
          chart.vis.attr('height', chart.crime_type_height)

        } else if (view_type == 'ages') {
          d3.select('#subheader').html('<em>Breakdown by Age</em>')
          chart.hide_label()
          chart.make_age_chart()
          chart.vis.attr('height', chart.height)

        // display categories
        // display motivation
        } else if (view_type == 'motivation') {
          d3.select('#subheader').html('<em>Breakdown by Motivation</em>')
          chart.display_bubbles()
          chart.display_cluster_label()
          chart.vis.attr('height', chart.motivation_height)

        // display identity
        // display line graph
        } else if (view_type == 'time'){
          d3.select('#subheader').html('<em>Crime Across Time</em>')
          chart.hide_label()
          chart.remove_circles()
          chart.vis.attr('height', chart.height)
          chart.make_linear_chart()
        //
        //
        } else {
          chart.state = 'all'
          d3.select('#subheader').html('<em>All Prize Winners</em>')
          chart.show_individuals()
          chart.move_override = 1
          chart.change_circle_color()
          chart.move_override = null
          chart.display_bubbles();
          chart.vis.on('click',null);

        }
      };

//    d3.json("data/crime-data.json", render_vis);
  queue()
    .defer(d3.json, "https://dev.api.xtown.la/api/crimes/hate_crimes")
    .defer(d3.json, "https://dev.api.xtown.la/api/crimes/hate_crimes/monthly?from=1262304000000")
    .await(render_vis);
  });
}).call(this);